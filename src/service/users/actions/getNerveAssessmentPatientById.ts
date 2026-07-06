import { CHECKUPS } from "../../../common/constants";
import { getPatientCheckupSummary } from "../../../common/patientCheckupQueries";
import { pool } from "../../../db";

const getNerveAssessmentPatientById = async (patientId: number) => {
  const patient = await getPatientCheckupSummary(
    patientId,
    CHECKUPS.NERVE_ASSESSMENT
  );

  if (!patient) {
    return null;
  }

  const { patient_checkup_id, ...patientDetails } = patient;

  const assessment = await pool.query(
    `
    SELECT
        selected_for_operation,
        remarks,
        created_at,
        updated_at
    FROM nerve_assessments
    WHERE patient_checkup_id = $1
    ORDER BY id DESC
    LIMIT 1
    `,
    [patient_checkup_id]
  );

  return {
    ...patientDetails,
    nerve_assessment: assessment.rows[0] ?? null,
  };
};

export default getNerveAssessmentPatientById;
