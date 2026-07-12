import { Router } from "express";
import { rateLimit, ipKeyGenerator } from "express-rate-limit";
import loginUser from "./actions/loginUser";
import verifyAdminPassword from "./actions/verifyAdminPassword";
import setAdminPassword from "./actions/setAdminPassword";
import { requireAuth } from "../../middleware/authMiddleware";

const router = Router();

// Keyed by the phone number being attempted, not just IP — a distributed
// attacker rotating IPs still only gets 5 tries against one account per
// 15-minute window. Falls back to IP when phone is missing/malformed,
// via express-rate-limit's own IPv6-safe helper for that case.
// skipSuccessfulRequests means a correct password doesn't count against
// the window, and a genuinely locked-out admin isn't reset by other
// people's unrelated login attempts.
const adminPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => {
    const phone = String(req.body?.phone || "").trim();
    return phone || ipKeyGenerator(req.ip || "unknown");
  },
  handler: (_req, res) => {
    return res.status(429).json({
      success: false,
      message: "Too many failed attempts. Please try again in 15 minutes.",
    });
  },
});

router.post("/login", async (req, res) => {
  try {
    const phone = String(req.body?.phone || "").trim();

    const response = await loginUser(phone);

    return res.status(200).json({
      success: true,
      message: "Login Successful",
      data: response,
    });
  } catch (error: any) {
    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
});

router.post("/admin/verify-password", adminPasswordLimiter, async (req, res) => {
  try {
    const phone = String(req.body?.phone || "").trim();
    const password = String(req.body?.password || "");

    const response = await verifyAdminPassword(phone, password);

    return res.status(200).json({
      success: true,
      message: "Login Successful",
      data: response,
    });
  } catch (error: any) {
    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
});

router.post("/admin/set-password", adminPasswordLimiter, async (req, res) => {
  try {
    const phone = String(req.body?.phone || "").trim();
    const password = String(req.body?.password || "");
    const confirmPassword = String(req.body?.confirmPassword || "");

    const response = await setAdminPassword(phone, password, confirmPassword);

    return res.status(201).json({
      success: true,
      message: "Password Created Successfully",
      data: response,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  return res.status(200).json({
    success: true,
    data: req.user,
  });
});

export default router;
