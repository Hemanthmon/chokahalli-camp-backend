import dotenv from "dotenv";

dotenv.config();

import { createServer } from "http";
import app from "./app";

import { pool } from "./db";
import { seedAdmin } from "./common/seedAdmin";
import { initSocket } from "./socket/socketServer";

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