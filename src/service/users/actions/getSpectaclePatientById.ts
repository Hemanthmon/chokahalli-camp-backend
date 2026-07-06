import { CHECKUPS } from "../../../common/constants";
import { getPatientCheckupSummary } from "../../../common/patientCheckupQueries";
import { pool } from "../../../db";

const getSpectaclePatientById = async (patientId: number) => {
  const patient = await getPatientCheckupSummary(
    patientId,
    CHECKUPS.SPECTACLE_CORRECTION
  );

  if (!patient) {
    return null;
  }

  const { patient_checkup_id, ...patientDetails } = patient;

  const correction = await pool.query(
    `
    SELECT
        left_eye,
        right_eye,
        spectacle_required,
        spectacle_status,
        remarks,
        created_at,
        updated_at
    FROM spectacle_corrections
    WHERE patient_checkup_id = $1
    ORDER BY id DESC
    LIMIT 1
    `,
    [patient_checkup_id]
  );

  return {
    ...patientDetails,
    spectacle_correction: correction.rows[0] ?? null,
  };
};

export default getSpectaclePatientById;
