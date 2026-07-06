"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIO = exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
const jwt_1 = require("../common/jwt");
const queues_1 = require("./queues");
const isWorkflowQueue = (room) => typeof room === "string" &&
    queues_1.ALL_WORKFLOW_QUEUES.includes(room);
let io = null;
const initSocket = (httpServer) => {
    io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token;
        if (!token) {
            return next(new Error("Authentication required"));
        }
        try {
            (0, jwt_1.verifyToken)(token);
            return next();
        }
        catch {
            return next(new Error("Invalid or expired session"));
        }
    });
    io.on("connection", (socket) => {
        socket.on("joinRoom", (room) => {
            if (isWorkflowQueue(room)) {
                socket.join(room);
            }
        });
        socket.on("leaveRoom", (room) => {
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
exports.initSocket = initSocket;
const getIO = () => io;
exports.getIO = getIO;
