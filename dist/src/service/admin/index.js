"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const listUsers_1 = __importDefault(require("./actions/listUsers"));
const createUser_1 = __importDefault(require("./actions/createUser"));
const updateUserStatus_1 = __importDefault(require("./actions/updateUserStatus"));
const listTests_1 = __importDefault(require("./actions/listTests"));
const createTest_1 = __importDefault(require("./actions/createTest"));
const updateTest_1 = __importDefault(require("./actions/updateTest"));
const setTestStatus_1 = __importDefault(require("./actions/setTestStatus"));
const getOperationList_1 = __importDefault(require("./actions/getOperationList"));
const router = (0, express_1.Router)();
router.get("/users", async (req, res) => {
    try {
        const response = await (0, listUsers_1.default)();
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
router.post("/users", async (req, res) => {
    try {
        const response = await (0, createUser_1.default)(req.body);
        return res.status(201).json({
            success: true,
            message: "User Created Successfully",
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
router.patch("/users/:id/status", async (req, res) => {
    try {
        const userId = Number(req.params.id);
        const active = Boolean(req.body?.active);
        const response = await (0, updateUserStatus_1.default)({ userId, active });
        return res.status(200).json({
            success: true,
            message: active ? "User Activated" : "User Deactivated",
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
        const response = await (0, listTests_1.default)();
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
router.post("/tests", async (req, res) => {
    try {
        const response = await (0, createTest_1.default)(req.body);
        return res.status(201).json({
            success: true,
            message: "Test Created Successfully",
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
router.patch("/tests/:id", async (req, res) => {
    try {
        const testId = Number(req.params.id);
        const response = await (0, updateTest_1.default)({ testId, name: req.body?.name });
        return res.status(200).json({
            success: true,
            message: "Test Updated Successfully",
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
router.patch("/tests/:id/status", async (req, res) => {
    try {
        const testId = Number(req.params.id);
        const isActive = Boolean(req.body?.active);
        const response = await (0, setTestStatus_1.default)({ testId, isActive });
        return res.status(200).json({
            success: true,
            message: isActive ? "Test Enabled" : "Test Disabled",
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
exports.default = router;
