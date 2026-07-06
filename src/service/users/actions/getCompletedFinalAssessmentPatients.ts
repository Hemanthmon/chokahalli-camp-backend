import { CHECKUPS } from "../../../common/constants";
import { getCompletedPatientsByCheckup } from "../../../common/patientCheckupQueries";

const getCompletedFinalAssessmentPatients = async () => {
  return getCompletedPatientsByCheckup(CHECKUPS.BP_SUGAR_TEST);
};

export default getCompletedFinalAssessmentPatients;
