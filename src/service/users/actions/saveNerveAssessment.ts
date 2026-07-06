import { CHECKUP_STATUS, CHECKUPS } from "../../../common/constants";
import { createPatientCheckup } from "../../../common/patientCheckUp";
import { findPatientCheckup } from "../../../common/findPatientCheckup";
import { pool } from "../../../db";
import { notifyQueueUpdated } from "../../../socket/notifyQueueUpdated";
import { WORKFLOW_QUEUES } from "../../../socket/queues";

interface SaveNerveAssessmentPayload {
  patient_id: number;
  selected_for_operation: boolean;
  remarks?: string;
}

const saveNerveAssessment = async (payload: SaveNerveAssessmentPayload) => {
  const { patient_id, selected_for_operation, remarks } = payload;

  if (!patient_id) {
    throw new Error("Patient is required");
  }

  if (selected_for_operation === undefined || selected_for_operation === null) {
    throw new Error("Selected For Operation is required");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const checkupRecord = await findPatientCheckup(
      client,
      patient_id,
      CHECKUPS.NERVE_ASSESSMENT
    );

    if (!checkupRecord) {
      throw new Error("No nerve assessment checkup found for this patient");
    }

    if (checkupRecord.status === CHECKUP_STATUS.SKIPPED) {
      throw new Error("This stage was skipped for this patient");
    }

    const patientCheckupId = checkupRecord.id;

    const existing = await client.query(
      `SELECT id, selected_for_operation FROM nerve_assessments WHERE patient_checkup_id = $1`,
      [patientCheckupId]
    );

    const isFirstSave = !existing.rows.length;
    const previousSelectedForOperation =
      existing.rows[0]?.selected_for_operation ?? null;

    const assessment = isFirstSave
      ? await client.query(
          `
          INSERT INTO nerve_assessments
          (
              patient_checkup_id,
              selected_for_operation,
              remarks
          )
          VALUES
          (
              $1, $2, $3
          )
          RETURNING *
          `,
          [patientCheckupId, selected_for_operation, remarks]
        )
      : await client.query(
          `
          UPDATE nerve_assessments
          SET
              selected_for_operation = $1,
              remarks = $2,
              updated_at = now()
          WHERE patient_checkup_id = $3
          RETURNING *
          `,
          [selected_for_operation, remarks, patientCheckupId]
        );

    if (isFirstSave) {
      await client.query(
        `
        UPDATE patient_checkups
        SET status = $1, completed_at = now()
        WHERE id = $2
        `,
        [CHECKUP_STATUS.COMPLETED, patientCheckupId]
      );

      if (selected_for_operation) {
        await createPatientCheckup(
          {
            patientId: patient_id,
            checkupId: CHECKUPS.BP_SUGAR_TEST,
            status: CHECKUP_STATUS.WAITING,
          },
          client
        );

        await createPatientCheckup(
          {
            patientId: patient_id,
            checkupId: CHECKUPS.OPERATION_RECOMMENDATION,
            status: CHECKUP_STATUS.WAITING,
          },
          client
        );
      } else {
        await createPatientCheckup(
          {
            patientId: patient_id,
            checkupId: CHECKUPS.BP_SUGAR_TEST,
            status: CHECKUP_STATUS.SKIPPED,
          },
          client
        );

        await createPatientCheckup(
          {
            patientId: patient_id,
            checkupId: CHECKUPS.OPERATION_RECOMMENDATION,
            status: CHECKUP_STATUS.SKIPPED,
          },
          client
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
    } else if (
      previousSelectedForOperation === false &&
      selected_for_operation === true
    ) {
      // Editing an already-completed assessment where the doctor changed
      // the decision from No to Yes. Re-open BP & Sugar / Operation
      // Recommendation together, but only if both are still SKIPPED — if
      // either has already moved on, something already happened downstream
      // and we leave it alone rather than silently rewriting it.
      const bpSugarCheckup = await findPatientCheckup(
        client,
        patient_id,
        CHECKUPS.BP_SUGAR_TEST
      );
      const operationCheckup = await findPatientCheckup(
        client,
        patient_id,
        CHECKUPS.OPERATION_RECOMMENDATION
      );

      const bothStillSkipped =
        bpSugarCheckup?.status === CHECKUP_STATUS.SKIPPED &&
        operationCheckup?.status === CHECKUP_STATUS.SKIPPED;

      if (bothStillSkipped) {
        await client.query(
          `
          UPDATE patient_checkups
          SET status = $1, completed_at = NULL
          WHERE id = ANY($2)
          `,
          [CHECKUP_STATUS.WAITING, [bpSugarCheckup.id, operationCheckup.id]]
        );

        await client.query(
          `
          UPDATE patients
          SET status = $1, updated_at = now()
          WHERE id = $2
          `,
          ["ACTIVE", patient_id]
        );
      }
    }

    await client.query("COMMIT");

    if (selected_for_operation) {
      notifyQueueUpdated(
        WORKFLOW_QUEUES.NERVE_ASSESSMENT,
        WORKFLOW_QUEUES.FINAL_ASSESSMENT,
        WORKFLOW_QUEUES.PATIENTS,
        WORKFLOW_QUEUES.DASHBOARD
      );
    } else {
      notifyQueueUpdated(
        WORKFLOW_QUEUES.NERVE_ASSESSMENT,
        WORKFLOW_QUEUES.PATIENTS,
        WORKFLOW_QUEUES.DASHBOARD
      );
    }

    return assessment.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export default saveNerveAssessment;
