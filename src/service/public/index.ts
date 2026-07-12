import { Router } from "express";
import findPatientsByMobile from "./actions/findPatientsByMobile";
import getPublicSpectacleStatus from "./actions/getPublicSpectacleStatus";

const router = Router();

// Step 1 of the public lookup flow: candidate list by mobile number only.
router.get("/spectacle-status/lookup", async (req, res) => {
  try {
    const mobile = String(req.query.mobile ?? "").trim();

    if (!mobile) {
      return res.status(400).json({
        success: false,
        message: "Mobile number is required",
      });
    }

    const response = await findPatientsByMobile(mobile);

    return res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Step 2: full public status detail, re-scoped by mobile + token together.
router.get("/spectacle-status", async (req, res) => {
  try {
    const mobile = String(req.query.mobile ?? "").trim();
    const tokenNumber = String(req.query.token_number ?? "").trim();

    if (!mobile || !tokenNumber) {
      return res.status(400).json({
        success: false,
        message: "Mobile number and token number are required",
      });
    }

    const response = await getPublicSpectacleStatus(mobile, tokenNumber);

    if (!response) {
      return res.status(404).json({
        success: false,
        message: "We couldn't find a matching record",
      });
    }

    return res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
