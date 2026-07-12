import { Router } from "express";
import getDoctorDashboardStats from "./actions/getDoctorDashboardStats";
import getPatientTimeline from "./actions/getPatientTimeline";
import getOperationList from "../admin/actions/getOperationList";
import getSpectacleDistributionList from "../admin/actions/getSpectacleDistributionList";
import getSpectacleDistributionStats from "../admin/actions/getSpectacleDistributionStats";

const router = Router();

router.get("/dashboard-stats", async (req, res) => {
  try {
    const response = await getDoctorDashboardStats();

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

router.get("/operation-list", async (req, res) => {
  try {
    const response = await getOperationList();

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

router.get("/spectacle-distribution", async (req, res) => {
  try {
    const response = await getSpectacleDistributionList();

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

router.get("/spectacle-distribution-stats", async (req, res) => {
  try {
    const response = await getSpectacleDistributionStats();

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

router.get("/patient/:patientId", async (req, res) => {
  try {
    const patientId = Number(req.params.patientId);
    const response = await getPatientTimeline(patientId);

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
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
