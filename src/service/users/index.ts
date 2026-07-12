import { Router } from "express";
import createPatient from "./actions/createPatients";
import searchLocation from "./actions/searchLoaction";
import getSpectaclePatients from "./actions/getSpectalesPatients";
import getCompletedSpectaclePatients from "./actions/getCompletedSpectaclePatients";
import getSpectaclePatientById from "./actions/getSpectaclePatientById";
import saveSpectacleCorrection from "./actions/saveSpectacleCorrection";
import recordSpectacleNotification from "./actions/recordSpectacleNotification";
import getSlitLampPatients from "./actions/getSlitLampPatients";
import getCompletedSlitLampPatients from "./actions/getCompletedSlitLampPatients";
import getSlitLampPatientById from "./actions/getSlitLampPatientById";
import saveSlitLampCheckup from "./actions/saveSlitLampCheckup";
import getNerveAssessmentPatients from "./actions/getNerveAssessmentPatients";
import getCompletedNerveAssessmentPatients from "./actions/getCompletedNerveAssessmentPatients";
import getNerveAssessmentPatientById from "./actions/getNerveAssessmentPatientById";
import saveNerveAssessment from "./actions/saveNerveAssessment";
import getFinalAssessmentPatients from "./actions/getFinalAssessmentPatients";
import getCompletedFinalAssessmentPatients from "./actions/getCompletedFinalAssessmentPatients";
import getFinalAssessmentPatientById from "./actions/getFinalAssessmentPatientById";
import saveFinalAssessment from "./actions/saveFinalAssessment";
import getActiveTests from "./actions/getActiveTests";
import getRecentPatients from "./actions/getRecentPatients";
import getAllPatients from "./actions/getAllPatients";
import updatePatient from "./actions/updatePatient";
import getTodayPatientCount from "./actions/getTodayPatientCount";
import { isRegistrationOpen } from "../../common/registrationStatus";


const router = Router();

router.post("/patient", async (req, res) => {
  if (!isRegistrationOpen()) {
    return res.status(403).json({
      success: false,
      message: "Camp registration is closed.",
    });
  }

  try {
    const response = await createPatient(req.body);

    return res.status(201).json({
      success: true,
      message: "Patient Registered Successfully",
      data: response,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});



router.get("/patient/recent", async (req, res) => {
    try {

        const response = await getRecentPatients();

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


router.get("/patient/today-count", async (req, res) => {
    try {

        const response = await getTodayPatientCount();

        return res.status(200).json({
            success: true,
            data: { count: response },
        });

    } catch (error: any) {

        return res.status(500).json({
            success: false,
            message: error.message,
        });

    }
});


router.get("/patients", async (req, res) => {
    try {

        const response = await getAllPatients();

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


router.patch("/patients/:id", async (req, res) => {
    try {

        const patientId = Number(req.params.id);

        const response = await updatePatient({ patientId, ...req.body });

        return res.status(200).json({
            success: true,
            message: "Patient Updated Successfully",
            data: response,
        });

    } catch (error: any) {

        return res.status(500).json({
            success: false,
            message: error.message,
        });

    }
});


router.get("/search", async (req, res) => {
    try {

        const search = String(req.query.search || "");

        const response = await searchLocation(search);

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


router.get( "/spectacle-correction", async(req,res)=>{

        try{
            const response =  await getSpectaclePatients();

            return res.status(200).json({
                success:true,
                data:response
            });

        }catch(error:any){

            return res.status(500).json({
                success:false,
                message:error.message
            });

        }

    }
)


router.get("/spectacle-correction/completed", async (req, res) => {
    try {

        const response = await getCompletedSpectaclePatients();

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


router.get("/spectacle-correction/:patientId", async (req, res) => {
    try {

        const patientId = Number(req.params.patientId);

        const response = await getSpectaclePatientById(patientId);

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


router.post("/spectacle-correction", async (req, res) => {
    try {

        const response = await saveSpectacleCorrection(req.body);

        return res.status(201).json({
            success: true,
            message: "Spectacle Correction Saved Successfully",
            data: response,
        });

    } catch (error: any) {

        return res.status(500).json({
            success: false,
            message: error.message,
        });

    }
});


router.post("/spectacle-correction/notify", async (req, res) => {
    try {

        const response = await recordSpectacleNotification(req.body);

        return res.status(200).json({
            success: true,
            message: "Notification Recorded",
            data: response,
        });

    } catch (error: any) {

        return res.status(500).json({
            success: false,
            message: error.message,
        });

    }
});


router.get("/slit-lamp", async (req, res) => {
    try {

        const response = await getSlitLampPatients();

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


router.get("/slit-lamp/completed", async (req, res) => {
    try {

        const response = await getCompletedSlitLampPatients();

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


router.get("/slit-lamp/:patientId", async (req, res) => {
    try {

        const patientId = Number(req.params.patientId);

        const response = await getSlitLampPatientById(patientId);

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


router.post("/slit-lamp", async (req, res) => {
    try {

        const response = await saveSlitLampCheckup(req.body);

        return res.status(201).json({
            success: true,
            message: "Slit Lamp Checkup Saved Successfully",
            data: response,
        });

    } catch (error: any) {

        return res.status(500).json({
            success: false,
            message: error.message,
        });

    }
});


router.get("/nerve-assessment", async (req, res) => {
    try {

        const response = await getNerveAssessmentPatients();

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


router.get("/nerve-assessment/completed", async (req, res) => {
    try {

        const response = await getCompletedNerveAssessmentPatients();

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


router.get("/nerve-assessment/:patientId", async (req, res) => {
    try {

        const patientId = Number(req.params.patientId);

        const response = await getNerveAssessmentPatientById(patientId);

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


router.post("/nerve-assessment", async (req, res) => {
    try {

        const response = await saveNerveAssessment(req.body);

        return res.status(201).json({
            success: true,
            message: "Nerve Assessment Saved Successfully",
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

        const response = await getActiveTests();

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


router.get("/final-assessment", async (req, res) => {
    try {

        const response = await getFinalAssessmentPatients();

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


router.get("/final-assessment/completed", async (req, res) => {
    try {

        const response = await getCompletedFinalAssessmentPatients();

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


router.get("/final-assessment/:patientId", async (req, res) => {
    try {

        const patientId = Number(req.params.patientId);

        const response = await getFinalAssessmentPatientById(patientId);

        if (!response) {
            return res.status(404).json({
                success: false,
                message: "Patient is not in the Final Assessment workflow.",
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


router.post("/final-assessment", async (req, res) => {
    try {

        const response = await saveFinalAssessment(req.body);

        return res.status(201).json({
            success: true,
            message: "Final Assessment Saved Successfully",
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