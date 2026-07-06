"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const constants_1 = require("../../common/constants");
const startCheckup_1 = require("../../common/startCheckup");
const notifyQueueUpdated_1 = require("../../socket/notifyQueueUpdated");
const queues_1 = require("../../socket/queues");
const getQueueByStatus_1 = __importDefault(require("./actions/getQueueByStatus"));
const getCompletedTodayQueue_1 = __importDefault(require("./actions/getCompletedTodayQueue"));
const router = (0, express_1.Router)();
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
        const response = await (0, startCheckup_1.startCheckup)(patientId, checkupId);
        const queue = queues_1.CHECKUP_QUEUE_MAP[checkupId];
        if (queue) {
            (0, notifyQueueUpdated_1.notifyQueueUpdated)(queue, queues_1.WORKFLOW_QUEUES.PATIENTS, queues_1.WORKFLOW_QUEUES.DASHBOARD);
        }
        return res.status(200).json({
            success: true,
            message: "Checkup started",
            data: response,
        });
    }
    catch (error) {
        return res.status(409).json({
            success: false,
            message: error.message,
        });
    }
});
router.get("/:room/waiting", async (req, res) => {
    try {
        const checkupId = constants_1.ROOM_CHECKUPS[req.params.room];
        if (!checkupId) {
            return res.status(404).json({
                success: false,
                message: "Unknown room",
            });
        }
        const response = await (0, getQueueByStatus_1.default)(checkupId, constants_1.CHECKUP_STATUS.WAITING);
        return res.status(200).json({
            success: true,
            data: response,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});
router.get("/:room/completed", async (req, res) => {
    try {
        const checkupId = constants_1.ROOM_CHECKUPS[req.params.room];
        if (!checkupId) {
            return res.status(404).json({
                success: false,
                message: "Unknown room",
            });
        }
        const response = await (0, getQueueByStatus_1.default)(checkupId, constants_1.CHECKUP_STATUS.COMPLETED);
        return res.status(200).json({
            success: true,
            data: response,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});
router.get("/:room/completed-today", async (req, res) => {
    try {
        const checkupId = constants_1.ROOM_CHECKUPS[req.params.room];
        if (!checkupId) {
            return res.status(404).json({
                success: false,
                message: "Unknown room",
            });
        }
        const response = await (0, getCompletedTodayQueue_1.default)(checkupId);
        return res.status(200).json({
            success: true,
            data: response,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});
exports.default = router;
