import { Router } from "express";
import listUsers from "./actions/listUsers";
import createUser from "./actions/createUser";
import updateUserStatus from "./actions/updateUserStatus";
import listTests from "./actions/listTests";
import createTest from "./actions/createTest";
import updateTest from "./actions/updateTest";
import setTestStatus from "./actions/setTestStatus";
import getOperationList from "./actions/getOperationList";
import getSpectacleDistributionList from "./actions/getSpectacleDistributionList";
import getSpectacleDistributionStats from "./actions/getSpectacleDistributionStats";
import getVillageVolunteers from "./actions/getVillageVolunteers";
import createVillageVolunteer from "./actions/createVillageVolunteer";
import updateVillageVolunteer from "./actions/updateVillageVolunteer";
import setVillageVolunteerStatus from "./actions/setVillageVolunteerStatus";

const router = Router();

router.get("/users", async (req, res) => {
  try {
    const response = await listUsers();

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

router.post("/users", async (req, res) => {
  try {
    const response = await createUser(req.body);

    return res.status(201).json({
      success: true,
      message: "User Created Successfully",
      data: response,
    });
  } catch (error: any) {
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

    const response = await updateUserStatus({ userId, active });

    return res.status(200).json({
      success: true,
      message: active ? "User Activated" : "User Deactivated",
      data: response,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.get("/tests", async (req, res) => {
  try {
    const response = await listTests();

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

router.post("/tests", async (req, res) => {
  try {
    const response = await createTest(req.body);

    return res.status(201).json({
      success: true,
      message: "Test Created Successfully",
      data: response,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.patch("/tests/:id", async (req, res) => {
  try {
    const testId = Number(req.params.id);

    const response = await updateTest({ testId, name: req.body?.name });

    return res.status(200).json({
      success: true,
      message: "Test Updated Successfully",
      data: response,
    });
  } catch (error: any) {
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

    const response = await setTestStatus({ testId, isActive });

    return res.status(200).json({
      success: true,
      message: isActive ? "Test Enabled" : "Test Disabled",
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

router.get("/village-volunteers", async (req, res) => {
  try {
    const response = await getVillageVolunteers();

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

router.post("/village-volunteers", async (req, res) => {
  try {
    const response = await createVillageVolunteer(req.body);

    return res.status(201).json({
      success: true,
      message: "Volunteer Added Successfully",
      data: response,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.patch("/village-volunteers/:id", async (req, res) => {
  try {
    const volunteerId = Number(req.params.id);

    const response = await updateVillageVolunteer({
      volunteerId,
      ...req.body,
    });

    return res.status(200).json({
      success: true,
      message: "Volunteer Updated Successfully",
      data: response,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.patch("/village-volunteers/:id/status", async (req, res) => {
  try {
    const volunteerId = Number(req.params.id);
    const active = Boolean(req.body?.active);

    const response = await setVillageVolunteerStatus({ volunteerId, active });

    return res.status(200).json({
      success: true,
      message: active ? "Volunteer Activated" : "Volunteer Deactivated",
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
