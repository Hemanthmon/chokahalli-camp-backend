import { getIO } from "./socketServer";
import type { WorkflowQueue } from "./queues";

export const notifyQueueUpdated = (...rooms: WorkflowQueue[]) => {
  try {
    const io = getIO();

    if (!io) {
      return;
    }

    for (const room of rooms) {
      io.to(room).emit("workflowUpdated", { queue: room });
    }
  } catch (error) {
    console.error("Failed to emit workflowUpdated event", error);
  }
};
