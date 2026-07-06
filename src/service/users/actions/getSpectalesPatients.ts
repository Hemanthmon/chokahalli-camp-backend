import { CHECKUPS } from "../../../common/constants";
import { getWaitingPatientsByCheckup } from "../../../common/patientCheckupQueries";

const getSpectaclePatients = async () => {
  return getWaitingPatientsByCheckup(CHECKUPS.SPECTACLE_CORRECTION);
};

export default getSpectaclePatients;
