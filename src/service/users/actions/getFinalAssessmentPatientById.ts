import { CHECKUP_STATUS, CHECKUPS } from "../../../common/constants";
import { getPatientCheckupSummary } from "../../../common/patientCheckupQueries";
import { pool } from "../../../db";

const getFinalAssessmentPatientById = async (patientId: number) => {
  const patient = await getPatientCheckupSummary(
    patientId,
    CHECKUPS.BP_SUGAR_TEST
  );

  if (!patient || patient.status === CHECKUP_STATUS.SKIPPED) {
    return null;
  }

  const { patient_checkup_id, ...patientDetails } = patient;

  const bpSugarTest = await pool.query(
    `
    SELECT id, bp, blood_sugar, remarks, created_at, updated_at
    FROM bp_sugar_tests
    WHERE patient_checkup_id = $1
    ORDER BY id DESC
    LIMIT 1
    `,
    [patient_checkup_id]
  );

  let testIds: number[] = [];

  if (bpSugarTest.rows.length) {
    const items = await pool.query(
      `
      SELECT test_id
      FROM bp_sugar_test_items
      WHERE bp_sugar_test_id = $1
      `,
      [bpSugarTest.rows[0].id]
    );

    testIds = items.rows.map((row) => row.test_id);
  }

  const operationSummary = await getPatientCheckupSummary(
    patientId,
    CHECKUPS.OPERATION_RECOMMENDATION
  );

  let operationRecommendation = null;

  if (operationSummary) {
    const recommendation = await pool.query(
      `
      SELECT operation_status, operation_type, remarks, created_at, updated_at
      FROM operation_recommendations
      WHERE patient_checkup_id = $1
      ORDER BY id DESC
      LIMIT 1
      `,
      [operationSummary.patient_checkup_id]
    );

    operationRecommendation = recommendation.rows[0] ?? null;
  }

  return {
    ...patientDetails,
    bp_sugar_test: bpSugarTest.rows.length
      ? {
          bp: bpSugarTest.rows[0].bp,
          blood_sugar: bpSugarTest.rows[0].blood_sugar,
          remarks: bpSugarTest.rows[0].remarks,
          test_ids: testIds,
          created_at: bpSugarTest.rows[0].created_at,
          updated_at: bpSugarTest.rows[0].updated_at,
        }
      : null,
    operation_recommendation: operationRecommendation,
  };
};

export default getFinalAssessmentPatientById;
