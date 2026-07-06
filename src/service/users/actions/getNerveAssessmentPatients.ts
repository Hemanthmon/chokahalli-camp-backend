import { CHECKUPS } from "../../../common/constants";
import { getWaitingPatientsByCheckup } from "../../../common/patientCheckupQueries";

const getNerveAssessmentPatients = async () => {
  return getWaitingPatientsByCheckup(CHECKUPS.NERVE_ASSESSMENT);
};

export default getNerveAssessmentPatients;
