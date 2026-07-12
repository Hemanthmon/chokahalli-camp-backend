import express from "express";
import cors from "cors";
import routes from "./routes/router";
import healthRouter from "./routes/healthRoutes";
import users from "./service/users/index"
import { isOriginAllowed } from "./common/allowedOrigins";

const app = express();

/**
 * Middlewares
 */

// app.use("/user", user);



app.use(
  cors({
    // Passing false (rather than an Error) here means a disallowed origin
    // just doesn't get CORS headers set — the browser blocks it client-side
    // the normal way, instead of the request 500ing server-side.
    origin: (origin, callback) => {
      callback(null, isOriginAllowed(origin));
    },
  })
);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));


app.use("/api", routes);

export default app;