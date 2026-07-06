import { CHECKUPS } from "../../../common/constants";
import { getWaitingPatientsByCheckup } from "../../../common/patientCheckupQueries";

const getSlitLampPatients = async () => {
  return getWaitingPatientsByCheckup(CHECKUPS.SLIT_LAMP_CHECKUP);
};

export default getSlitLampPatients;
