"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const router = (0, express_1.Router)();
router.get("/", async (_, res) => {
    try {
        await db_1.pool.query("SELECT NOW()");
        res.status(200).json({
            success: true,
            message: "VisionFlow API is running 🚀",
            database: "Connected",
            timestamp: new Date(),
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Database connection failed",
        });
    }
});
exports.default = router;
