"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const getDoctorDashboardStats_1 = __importDefault(require("./actions/getDoctorDashboardStats"));
const getPatientTimeline_1 = __importDefault(require("./actions/getPatientTimeline"));
const getOperationList_1 = __importDefault(require("../admin/actions/getOperationList"));
const router = (0, express_1.Router)();
router.get("/dashboard-stats", async (req, res) => {
    try {
        const response = await (0, getDoctorDashboardStats_1.default)();
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
router.get("/operation-list", async (req, res) => {
    try {
        const response = await (0, getOperationList_1.default)();
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
router.get("/patient/:patientId", async (req, res) => {
    try {
        const patientId = Number(req.params.patientId);
        const response = await (0, getPatientTimeline_1.default)(patientId);
        if (!response) {
            return res.status(404).json({
                success: false,
                message: "Patient not found",
            });
        }
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
