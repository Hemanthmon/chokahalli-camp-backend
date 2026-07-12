import type { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { verifyToken } from "../common/jwt";
import { isOriginAllowed } from "../common/allowedOrigins";
import { ALL_WORKFLOW_QUEUES, type WorkflowQueue } from "./queues";

const isWorkflowQueue = (room: unknown): room is WorkflowQueue =>
  typeof room === "string" &&
  (ALL_WORKFLOW_QUEUES as string[]).includes(room);

let io: Server | null = null;

export const initSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => callback(null, isOriginAllowed(origin)),
      methods: ["GET", "POST"],
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Authentication required"));
    }

    try {
      verifyToken(token);
      return next();
    } catch {
      return next(new Error("Invalid or expired session"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("joinRoom", (room: unknown) => {
      if (isWorkflowQueue(room)) {
        socket.join(room);
      }
    });

    socket.on("leaveRoom", (room: unknown) => {
      if (isWorkflowQueue(room)) {
        socket.leave(room);
      }
    });

    socket.on("disconnect", () => {
      // Room membership is tied to this connection and is cleaned up
      // automatically by Socket.IO — nothing else to do here.
    });
  });

  console.log("🔌 Socket.IO initialized");

  return io;
};

export const getIO = () => io;
