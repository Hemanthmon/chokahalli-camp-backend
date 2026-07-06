import express from "express";
import cors from "cors";
import routes from "./routes/router";
import healthRouter from "./routes/healthRoutes";
import users from "./service/users/index"

const app = express();

/**
 * Middlewares
 */

// app.use("/user", user);



app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));


app.use("/api", routes);

export default app;