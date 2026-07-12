import dotenv from "dotenv";

dotenv.config();

import { createServer } from "http";
import app from "./app";

import { pool } from "./db";
import { seedAdmin } from "./common/seedAdmin";
import { initSocket, getIO } from "./socket/socketServer";

const PORT = Number(process.env.PORT) || 5000;

const httpServer = createServer(app);

initSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

pool
  .connect()
  .then(async (client) => {
    client.release();
    await seedAdmin();
  })
  .catch(() => {
    // connection errors are already logged in ./db
  });

// Without this, neither `tsx watch` restarts nor Render's SIGTERM-before-
// redeploy have anything to wait for — the http server, Socket.IO clients,
// and the pg pool's open connections all stay open, so the process hangs
// until the runner force-kills it instead of exiting cleanly.
const shutdown = async () => {
  console.log("🛑 Shutting down gracefully...");

  const forceExitTimer = setTimeout(() => {
    console.warn("⚠️ Graceful shutdown took too long, forcing exit");
    process.exit(1);
  }, 5000);

  // http.Server#close() only stops accepting *new* connections — it waits
  // for existing keep-alive connections to close on their own, which can
  // hang indefinitely under real traffic. Force them shut immediately.
  httpServer.closeAllConnections();

  // Socket.IO was attached to this same httpServer (`new Server(httpServer)`),
  // so io.close() already closes it internally — calling httpServer.close()
  // separately afterward double-closes it and its callback never fires.
  // Wait on whichever one actually owns the close, not both.
  const io = getIO();

  await new Promise<void>((resolve) => {
    if (io) {
      io.close(() => resolve());
    } else {
      httpServer.close(() => resolve());
    }
  });

  // pool.end() can hang against Neon's pooler endpoint under some
  // conditions — the forceExitTimer above guarantees the process still
  // exits within 5s either way, so this is a best-effort drain, not a
  // requirement for shutting down cleanly.
  await pool.end();

  clearTimeout(forceExitTimer);
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);