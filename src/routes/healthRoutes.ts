import { Router } from "express";
import { pool } from "../db";

const router = Router();

router.get("/", async (_, res) => {
  try {
    await pool.query("SELECT NOW()");

    res.status(200).json({
      success: true,
      message: "VisionFlow API is running 🚀",
      database: "Connected",
      timestamp: new Date(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

export default router;