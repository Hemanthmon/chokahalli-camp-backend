import { CHECKUPS } from "../../../common/constants";
import { getCompletedPatientsByCheckup } from "../../../common/patientCheckupQueries";

const getCompletedSpectaclePatients = async () => {
  return getCompletedPatientsByCheckup(CHECKUPS.SPECTACLE_CORRECTION);
};

export default getCompletedSpectaclePatients;
