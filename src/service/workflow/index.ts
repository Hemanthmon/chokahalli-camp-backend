import { Router } from "express";
import { CHECKUP_STATUS, ROOM_CHECKUPS } from "../../common/constants";
import { startCheckup } from "../../common/startCheckup";
import { notifyQueueUpdated } from "../../socket/notifyQueueUpdated";
import { CHECKUP_QUEUE_MAP, WORKFLOW_QUEUES } from "../../socket/queues";
import getQueueByStatus from "./actions/getQueueByStatus";
import getCompletedTodayQueue from "./actions/getCompletedTodayQueue";

const router = Router();

router.post("/start", async (req, res) => {
  try {
    const patientId = Number(req.body.patient_id);
    const checkupId = Number(req.body.checkup_id);

    if (!patientId || !checkupId) {
      return res.status(400).json({
        success: false,
        message: "patient_id and checkup_id are required",
      });
    }

    const response = await startCheckup(patientId, checkupId);

    const queue = CHECKUP_QUEUE_MAP[checkupId];

    if (queue) {
      notifyQueueUpdated(queue, WORKFLOW_QUEUES.PATIENTS, WORKFLOW_QUEUES.DASHBOARD);
    }

    return res.status(200).json({
      success: true,
      message: "Checkup started",
      data: response,
    });
  } catch (error: any) {
    return res.status(409).json({
      success: false,
      message: error.message,
    });
  }
});

router.get("/:room/waiting", async (req, res) => {
  try {
    const checkupId = ROOM_CHECKUPS[req.params.room];

    if (!checkupId) {
      return res.status(404).json({
        success: false,
        message: "Unknown room",
      });
    }

    const response = await getQueueByStatus(checkupId, CHECKUP_STATUS.WAITING);

    return res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.get("/:room/completed", async (req, res) => {
  try {
    const checkupId = ROOM_CHECKUPS[req.params.room];

    if (!checkupId) {
      return res.status(404).json({
        success: false,
        message: "Unknown room",
      });
    }

    const response = await getQueueByStatus(checkupId, CHECKUP_STATUS.COMPLETED);

    return res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.get("/:room/completed-today", async (req, res) => {
  try {
    const checkupId = ROOM_CHECKUPS[req.params.room];

    if (!checkupId) {
      return res.status(404).json({
        success: false,
        message: "Unknown room",
      });
    }

    const response = await getCompletedTodayQueue(checkupId);

    return res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
