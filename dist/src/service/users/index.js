"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const createPatients_1 = __importDefault(require("./actions/createPatients"));
const searchLoaction_1 = __importDefault(require("./actions/searchLoaction"));
const getSpectalesPatients_1 = __importDefault(require("./actions/getSpectalesPatients"));
const getCompletedSpectaclePatients_1 = __importDefault(require("./actions/getCompletedSpectaclePatients"));
const getSpectaclePatientById_1 = __importDefault(require("./actions/getSpectaclePatientById"));
const saveSpectacleCorrection_1 = __importDefault(require("./actions/saveSpectacleCorrection"));
const getSlitLampPatients_1 = __importDefault(require("./actions/getSlitLampPatients"));
const getCompletedSlitLampPatients_1 = __importDefault(require("./actions/getCompletedSlitLampPatients"));
const getSlitLampPatientById_1 = __importDefault(require("./actions/getSlitLampPatientById"));
const saveSlitLampCheckup_1 = __importDefault(require("./actions/saveSlitLampCheckup"));
const getNerveAssessmentPatients_1 = __importDefault(require("./actions/getNerveAssessmentPatients"));
const getCompletedNerveAssessmentPatients_1 = __importDefault(require("./actions/getCompletedNerveAssessmentPatients"));
const getNerveAssessmentPatientById_1 = __importDefault(require("./actions/getNerveAssessmentPatientById"));
const saveNerveAssessment_1 = __importDefault(require("./actions/saveNerveAssessment"));
const getFinalAssessmentPatients_1 = __importDefault(require("./actions/getFinalAssessmentPatients"));
const getCompletedFinalAssessmentPatients_1 = __importDefault(require("./actions/getCompletedFinalAssessmentPatients"));
const getFinalAssessmentPatientById_1 = __importDefault(require("./actions/getFinalAssessmentPatientById"));
const saveFinalAssessment_1 = __importDefault(require("./actions/saveFinalAssessment"));
const getActiveTests_1 = __importDefault(require("./actions/getActiveTests"));
const getRecentPatients_1 = __importDefault(require("./actions/getRecentPatients"));
const getAllPatients_1 = __importDefault(require("./actions/getAllPatients"));
const updatePatient_1 = __importDefault(require("./actions/updatePatient"));
const getTodayPatientCount_1 = __importDefault(require("./actions/getTodayPatientCount"));
const registrationStatus_1 = require("../../common/registrationStatus");
const router = (0, express_1.Router)();
router.post("/patient", async (req, res) => {
    if (!(0, registrationStatus_1.isRegistrationOpen)()) {
        return res.status(403).json({
            success: false,
            message: "Camp registration is closed.",
        });
    }
    try {
        const response = await (0, createPatients_1.default)(req.body);
        return res.status(201).json({
            success: true,
            message: "Patient Registered Successfully",
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
router.get("/patient/recent", async (req, res) => {
    try {
        const response = await (0, getRecentPatients_1.default)();
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
router.get("/patient/today-count", async (req, res) => {
    try {
        const response = await (0, getTodayPatientCount_1.default)();
        return res.status(200).json({
            success: true,
            data: { count: response },
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});
router.get("/patients", async (req, res) => {
    try {
        const response = await (0, getAllPatients_1.default)();
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
router.patch("/patients/:id", async (req, res) => {
    try {
        const patientId = Number(req.params.id);
        const response = await (0, updatePatient_1.default)({ patientId, ...req.body });
        return res.status(200).json({
            success: true,
            message: "Patient Updated Successfully",
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
router.get("/search", async (req, res) => {
    try {
        const search = String(req.query.search || "");
        const response = await (0, searchLoaction_1.default)(search);
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
router.get("/spectacle-correction", async (req, res) => {
    try {
        const response = await (0, getSpectalesPatients_1.default)();
        return res.status(200).json({
            success: true,
            data: response
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});
router.get("/spectacle-correction/completed", async (req, res) => {
    try {
        const response = await (0, getCompletedSpectaclePatients_1.default)();
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
router.get("/spectacle-correction/:patientId", async (req, res) => {
    try {
        const patientId = Number(req.params.patientId);
        const response = await (0, getSpectaclePatientById_1.default)(patientId);
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
router.post("/spectacle-correction", async (req, res) => {
    try {
        const response = await (0, saveSpectacleCorrection_1.default)(req.body);
        return res.status(201).json({
            success: true,
            message: "Spectacle Correction Saved Successfully",
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
router.get("/slit-lamp", async (req, res) => {
    try {
        const response = await (0, getSlitLampPatients_1.default)();
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
router.get("/slit-lamp/completed", async (req, res) => {
    try {
        const response = await (0, getCompletedSlitLampPatients_1.default)();
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
router.get("/slit-lamp/:patientId", async (req, res) => {
    try {
        const patientId = Number(req.params.patientId);
        const response = await (0, getSlitLampPatientById_1.default)(patientId);
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
router.post("/slit-lamp", async (req, res) => {
    try {
        const response = await (0, saveSlitLampCheckup_1.default)(req.body);
        return res.status(201).json({
            success: true,
            message: "Slit Lamp Checkup Saved Successfully",
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
router.get("/nerve-assessment", async (req, res) => {
    try {
        const response = await (0, getNerveAssessmentPatients_1.default)();
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
router.get("/nerve-assessment/completed", async (req, res) => {
    try {
        const response = await (0, getCompletedNerveAssessmentPatients_1.default)();
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
router.get("/nerve-assessment/:patientId", async (req, res) => {
    try {
        const patientId = Number(req.params.patientId);
        const response = await (0, getNerveAssessmentPatientById_1.default)(patientId);
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
router.post("/nerve-assessment", async (req, res) => {
    try {
        const response = await (0, saveNerveAssessment_1.default)(req.body);
        return res.status(201).json({
            success: true,
            message: "Nerve Assessment Saved Successfully",
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
router.get("/tests", async (req, res) => {
    try {
        const response = await (0, getActiveTests_1.default)();
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
router.get("/final-assessment", async (req, res) => {
    try {
        const response = await (0, getFinalAssessmentPatients_1.default)();
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
router.get("/final-assessment/completed", async (req, res) => {
    try {
        const response = await (0, getCompletedFinalAssessmentPatients_1.default)();
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
router.get("/final-assessment/:patientId", async (req, res) => {
    try {
        const patientId = Number(req.params.patientId);
        const response = await (0, getFinalAssessmentPatientById_1.default)(patientId);
        if (!response) {
            return res.status(404).json({
                success: false,
                message: "Patient is not in the Final Assessment workflow.",
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
router.post("/final-assessment", async (req, res) => {
    try {
        const response = await (0, saveFinalAssessment_1.default)(req.body);
        return res.status(201).json({
            success: true,
            message: "Final Assessment Saved Successfully",
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
