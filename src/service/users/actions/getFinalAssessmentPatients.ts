import { CHECKUPS } from "../../../common/constants";
import { getWaitingPatientsByCheckup } from "../../../common/patientCheckupQueries";

const getFinalAssessmentPatients = async () => {
  return getWaitingPatientsByCheckup(CHECKUPS.BP_SUGAR_TEST);
};

export default getFinalAssessmentPatients;
