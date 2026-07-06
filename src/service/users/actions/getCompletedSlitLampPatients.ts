import { CHECKUPS } from "../../../common/constants";
import { getCompletedPatientsByCheckup } from "../../../common/patientCheckupQueries";

const getCompletedSlitLampPatients = async () => {
  return getCompletedPatientsByCheckup(CHECKUPS.SLIT_LAMP_CHECKUP);
};

export default getCompletedSlitLampPatients;
