import { CHECKUPS } from "../../../common/constants";
import { getPatientCheckupSummary } from "../../../common/patientCheckupQueries";
import { pool } from "../../../db";

const getSlitLampPatientById = async (patientId: number) => {
  const patient = await getPatientCheckupSummary(
    patientId,
    CHECKUPS.SLIT_LAMP_CHECKUP
  );

  if (!patient) {
    return null;
  }

  const { patient_checkup_id, ...patientDetails } = patient;

  const checkup = await pool.query(
    `
    SELECT
        cataract_present,
        affected_eye,
        medicine_given,
        proceed_to_nerve,
        remarks,
        created_at,
        updated_at
    FROM slit_lamp_checkups
    WHERE patient_checkup_id = $1
    ORDER BY id DESC
    LIMIT 1
    `,
    [patient_checkup_id]
  );

  return {
    ...patientDetails,
    slit_lamp_checkup: checkup.rows[0] ?? null,
  };
};

export default getSlitLampPatientById;
