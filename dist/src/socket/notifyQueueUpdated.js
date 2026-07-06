"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifyQueueUpdated = void 0;
const socketServer_1 = require("./socketServer");
const notifyQueueUpdated = (...rooms) => {
    try {
        const io = (0, socketServer_1.getIO)();
        if (!io) {
            return;
        }
        for (const room of rooms) {
            io.to(room).emit("workflowUpdated", { queue: room });
        }
    }
    catch (error) {
        console.error("Failed to emit workflowUpdated event", error);
    }
};
exports.notifyQueueUpdated = notifyQueueUpdated;
