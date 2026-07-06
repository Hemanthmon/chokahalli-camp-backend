"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const loginUser_1 = __importDefault(require("./actions/loginUser"));
const authMiddleware_1 = require("../../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.post("/login", async (req, res) => {
    try {
        const phone = String(req.body?.phone || "").trim();
        const response = await (0, loginUser_1.default)(phone);
        return res.status(200).json({
            success: true,
            message: "Login Successful",
            data: response,
        });
    }
    catch (error) {
        return res.status(401).json({
            success: false,
            message: error.message,
        });
    }
});
router.get("/me", authMiddleware_1.requireAuth, async (req, res) => {
    return res.status(200).json({
        success: true,
        data: req.user,
    });
});
exports.default = router;
