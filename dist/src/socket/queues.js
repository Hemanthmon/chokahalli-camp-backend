"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CHECKUP_QUEUE_MAP = exports.ALL_WORKFLOW_QUEUES = exports.WORKFLOW_QUEUES = void 0;
const constants_1 = require("../common/constants");
exports.WORKFLOW_QUEUES = {
    PATIENTS: "patients",
    SPECTACLE_CORRECTION: "spectacle-correction",
    SLIT_LAMP: "slit-lamp",
    NERVE_ASSESSMENT: "nerve-assessment",
    FINAL_ASSESSMENT: "final-assessment",
    DASHBOARD: "dashboard",
};
exports.ALL_WORKFLOW_QUEUES = Object.values(exports.WORKFLOW_QUEUES);
// Maps a numeric checkup id to the Socket.IO room that represents its queue.
// Used by the generic /workflow/start endpoint, which only knows a checkup id.
exports.CHECKUP_QUEUE_MAP = {
    [constants_1.CHECKUPS.SPECTACLE_CORRECTION]: exports.WORKFLOW_QUEUES.SPECTACLE_CORRECTION,
    [constants_1.CHECKUPS.SLIT_LAMP_CHECKUP]: exports.WORKFLOW_QUEUES.SLIT_LAMP,
    [constants_1.CHECKUPS.NERVE_ASSESSMENT]: exports.WORKFLOW_QUEUES.NERVE_ASSESSMENT,
    [constants_1.CHECKUPS.BP_SUGAR_TEST]: exports.WORKFLOW_QUEUES.FINAL_ASSESSMENT,
    [constants_1.CHECKUPS.OPERATION_RECOMMENDATION]: exports.WORKFLOW_QUEUES.FINAL_ASSESSMENT,
};
