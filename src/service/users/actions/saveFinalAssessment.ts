import { CHECKUP_STATUS, CHECKUPS } from "../../../common/constants";
import { findPatientCheckup } from "../../../common/findPatientCheckup";
import { pool } from "../../../db";
import { notifyQueueUpdated } from "../../../socket/notifyQueueUpdated";
import { WORKFLOW_QUEUES } from "../../../socket/queues";

interface SaveFinalAssessmentPayload {
  patient_id: number;
  bp?: string;
  blood_sugar?: string;
  test_ids?: number[];
  operation_status: string;
  operation_type?: string;
  remarks?: string;
}

const saveFinalAssessment = async (payload: SaveFinalAssessmentPayload) => {
  const {
    patient_id,
    bp,
    blood_sugar,
    test_ids,
    operation_status,
    operation_type,
    remarks,
  } = payload;

  if (!patient_id) {
    throw new Error("Patient is required");
  }

  if (!operation_status) {
    throw new Error("Operation Status is required");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const bpSugarCheckupRecord = await findPatientCheckup(
      client,
      patient_id,
      CHECKUPS.BP_SUGAR_TEST
    );

    if (!bpSugarCheckupRecord || bpSugarCheckupRecord.status === CHECKUP_STATUS.SKIPPED) {
      throw new Error("Patient is not in the Final Assessment workflow");
    }

    const bpSugarCheckupId = bpSugarCheckupRecord.id;

    const existingBpSugarTest = await client.query(
      `SELECT id FROM bp_sugar_tests WHERE patient_checkup_id = $1`,
      [bpSugarCheckupId]
    );

    const isFirstSave = !existingBpSugarTest.rows.length;

    const bpSugarTest = isFirstSave
      ? await client.query(
          `
          INSERT INTO bp_sugar_tests
          (
              patient_checkup_id,
              bp,
              blood_sugar,
              remarks
          )
          VALUES
          (
              $1, $2, $3, $4
          )
          RETURNING id
          `,
          [bpSugarCheckupId, bp, blood_sugar, remarks]
        )
      : await client.query(
          `
          UPDATE bp_sugar_tests
          SET bp = $1, blood_sugar = $2, remarks = $3, updated_at = now()
          WHERE patient_checkup_id = $4
          RETURNING id
          `,
          [bp, blood_sugar, remarks, bpSugarCheckupId]
        );

    const bpSugarTestId = bpSugarTest.rows[0].id;

    // Always replace the mapping so it reflects the latest selection,
    // whether this is the first save or an edit.
    await client.query(
      `DELETE FROM bp_sugar_test_items WHERE bp_sugar_test_id = $1`,
      [bpSugarTestId]
    );

    for (const testId of test_ids ?? []) {
      await client.query(
        `
        INSERT INTO bp_sugar_test_items
        (
            bp_sugar_test_id,
            test_id
        )
        VALUES
        (
            $1, $2
        )
        `,
        [bpSugarTestId, testId]
      );
    }

    const operationCheckupRecord = await findPatientCheckup(
      client,
      patient_id,
      CHECKUPS.OPERATION_RECOMMENDATION
    );

    if (
      !operationCheckupRecord ||
      operationCheckupRecord.status === CHECKUP_STATUS.SKIPPED
    ) {
      throw new Error("Patient is not in the Final Assessment workflow");
    }

    const operationCheckupId = operationCheckupRecord.id;

    const existingOperationRecommendation = await client.query(
      `SELECT id FROM operation_recommendations WHERE patient_checkup_id = $1`,
      [operationCheckupId]
    );

    const operationRecommendation = existingOperationRecommendation.rows.length
      ? await client.query(
          `
          UPDATE operation_recommendations
          SET
              operation_status = $1,
              operation_type = $2,
              remarks = $3,
              updated_at = now()
          WHERE patient_checkup_id = $4
          RETURNING *
          `,
          [operation_status, operation_type, remarks, operationCheckupId]
        )
      : await client.query(
          `
          INSERT INTO operation_recommendations
          (
              patient_checkup_id,
              operation_status,
              operation_type,
              remarks
          )
          VALUES
          (
              $1, $2, $3, $4
          )
          RETURNING *
          `,
          [operationCheckupId, operation_status, operation_type, remarks]
        );

    if (isFirstSave) {
      await client.query(
        `
        UPDATE patient_checkups
        SET status = $1, completed_at = now()
        WHERE id = ANY($2)
        `,
        [CHECKUP_STATUS.COMPLETED, [bpSugarCheckupId, operationCheckupId]]
      );

      await client.query(
        `
        UPDATE patients
        SET status = $1, updated_at = now()
        WHERE id = $2
        `,
        [CHECKUP_STATUS.COMPLETED, patient_id]
      );
    }

    await client.query("COMMIT");

    notifyQueueUpdated(
      WORKFLOW_QUEUES.FINAL_ASSESSMENT,
      WORKFLOW_QUEUES.PATIENTS,
      WORKFLOW_QUEUES.DASHBOARD
    );

    return operationRecommendation.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export default saveFinalAssessment;
