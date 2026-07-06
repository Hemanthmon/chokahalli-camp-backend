import { Router } from "express";
import loginUser from "./actions/loginUser";
import { requireAuth } from "../../middleware/authMiddleware";

const router = Router();

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

router.get("/me", requireAuth, async (req, res) => {
  return res.status(200).json({
    success: true,
    data: req.user,
  });
});

export default router;
