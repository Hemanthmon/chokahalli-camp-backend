import { CHECKUPS } from "../../../common/constants";
import { getCompletedPatientsByCheckup } from "../../../common/patientCheckupQueries";

const getCompletedNerveAssessmentPatients = async () => {
  return getCompletedPatientsByCheckup(CHECKUPS.NERVE_ASSESSMENT);
};

export default getCompletedNerveAssessmentPatients;
