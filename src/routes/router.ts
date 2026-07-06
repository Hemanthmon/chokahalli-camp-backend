import { Router } from "express";

import healthRoutes from "./healthRoutes";
import configRoutes from "./configRoutes";
import userRoutes from "../service/users";
import authRoutes from "../service/auth";
import adminRoutes from "../service/admin";
import workflowRoutes from "../service/workflow";
import doctorRoutes from "../service/doctor";
import { requireAuth, requireRole } from "../middleware/authMiddleware";
import { ROLES } from "../common/constants";

const router = Router();

router.use("/health", healthRoutes);
router.use("/config", configRoutes);
router.use("/auth", authRoutes);
router.use("/users", requireAuth, userRoutes);
router.use("/workflow", requireAuth, workflowRoutes);
router.use("/admin", requireAuth, requireRole(ROLES.ADMIN), adminRoutes);
router.use("/doctor", requireAuth, requireRole(ROLES.DOCTOR), doctorRoutes);

export default router;
