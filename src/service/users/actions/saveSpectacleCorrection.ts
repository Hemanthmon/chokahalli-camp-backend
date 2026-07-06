import { CHECKUP_STATUS, CHECKUPS } from "../../../common/constants";
import { createPatientCheckup } from "../../../common/patientCheckUp";
import { findPatientCheckup } from "../../../common/findPatientCheckup";
import { pool } from "../../../db";
import { notifyQueueUpdated } from "../../../socket/notifyQueueUpdated";
import { WORKFLOW_QUEUES } from "../../../socket/queues";

interface SaveSpectacleCorrectionPayload {
  patient_id: number;
  left_eye?: string;
  right_eye?: string;
  spectacle_required?: boolean;
  spectacle_status?: string;
  remarks?: string;
}

const saveSpectacleCorrection = async (payload: SaveSpectacleCorrectionPayload) => {
  const {
    patient_id,
    left_eye,
    right_eye,
    spectacle_required,
    spectacle_status,
    remarks,
  } = payload;

  if (!patient_id) {
    throw new Error("Patient is required");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const checkup = await findPatientCheckup(
      client,
      patient_id,
      CHECKUPS.SPECTACLE_CORRECTION
    );

    if (!checkup) {
      throw new Error("No spectacle correction checkup found for this patient");
    }

    if (checkup.status === CHECKUP_STATUS.SKIPPED) {
      throw new Error("This stage was skipped for this patient");
    }

    const patientCheckupId = checkup.id;

    const existing = await client.query(
      `SELECT id FROM spectacle_corrections WHERE patient_checkup_id = $1`,
      [patientCheckupId]
    );

    const isFirstSave = !existing.rows.length;

    const correction = isFirstSave
      ? await client.query(
          `
          INSERT INTO spectacle_corrections
          (
              patient_checkup_id,
              left_eye,
              right_eye,
              spectacle_required,
              spectacle_status,
              remarks
          )
          VALUES
          (
              $1, $2, $3, $4, $5, $6
          )
          RETURNING *
          `,
          [
            patientCheckupId,
            left_eye,
            right_eye,
            spectacle_required ?? false,
            spectacle_status,
            remarks,
          ]
        )
      : await client.query(
          `
          UPDATE spectacle_corrections
          SET
              left_eye = $1,
              right_eye = $2,
              spectacle_required = $3,
              spectacle_status = $4,
              remarks = $5,
              updated_at = now()
          WHERE patient_checkup_id = $6
          RETURNING *
          `,
          [
            left_eye,
            right_eye,
            spectacle_required ?? false,
            spectacle_status,
            remarks,
            patientCheckupId,
          ]
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

      await createPatientCheckup(
        {
          patientId: patient_id,
          checkupId: CHECKUPS.SLIT_LAMP_CHECKUP,
          status: CHECKUP_STATUS.WAITING,
        },
        client
      );
    }

    await client.query("COMMIT");

    notifyQueueUpdated(
      WORKFLOW_QUEUES.SPECTACLE_CORRECTION,
      WORKFLOW_QUEUES.SLIT_LAMP,
      WORKFLOW_QUEUES.PATIENTS,
      WORKFLOW_QUEUES.DASHBOARD
    );

    return correction.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export default saveSpectacleCorrection;
