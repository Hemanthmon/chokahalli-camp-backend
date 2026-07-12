import { CHECKUP_STATUS, CHECKUPS, SPECTACLE_STATUS } from "../../../common/constants";
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
  // Whether completing this stage should enqueue the patient into the next
  // clinical stage (Slit Lamp). Live clinical exams should leave this true;
  // administrative saves that record status without an in-person exam
  // (e.g. reconstructing historical records) should pass false.
  progress_to_next_stage?: boolean;
}

const saveSpectacleCorrection = async (payload: SaveSpectacleCorrectionPayload) => {
  const {
    patient_id,
    left_eye,
    right_eye,
    spectacle_required,
    spectacle_status,
    remarks,
    progress_to_next_stage = true,
  } = payload;

  if (!patient_id) {
    throw new Error("Patient is required");
  }

  if (
    spectacle_status !== undefined &&
    !Object.values(SPECTACLE_STATUS).includes(spectacle_status as any)
  ) {
    throw new Error("Invalid spectacle status");
  }

  // spectacle_required is derived from spectacle_status, not accepted
  // independently, so the two columns can never drift apart: NOT_REQUIRED
  // means false, every other canonical status means true. When a caller
  // doesn't touch spectacle_status at all, fall back to whatever it passed
  // (or leave the existing value untouched on update — see COALESCE below).
  const resolvedRequired =
    spectacle_status !== undefined
      ? spectacle_status !== SPECTACLE_STATUS.NOT_REQUIRED
      : spectacle_required;

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
            resolvedRequired ?? false,
            spectacle_status,
            remarks,
          ]
        )
      : await client.query(
          `
          UPDATE spectacle_corrections
          SET
              left_eye = COALESCE($1, left_eye),
              right_eye = COALESCE($2, right_eye),
              spectacle_required = COALESCE($3, spectacle_required),
              spectacle_status = COALESCE($4, spectacle_status),
              remarks = COALESCE($5, remarks),
              updated_at = now()
          WHERE patient_checkup_id = $6
          RETURNING *
          `,
          [
            left_eye,
            right_eye,
            resolvedRequired,
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

      if (progress_to_next_stage) {
        await createPatientCheckup(
          {
            patientId: patient_id,
            checkupId: CHECKUPS.SLIT_LAMP_CHECKUP,
            status: CHECKUP_STATUS.WAITING,
          },
          client
        );
      }
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
