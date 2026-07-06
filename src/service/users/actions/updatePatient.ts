import { pool } from "../../../db";
import { findOrCreateLocation } from "../../../common/findOrCreateLocation";
import { notifyQueueUpdated } from "../../../socket/notifyQueueUpdated";
import { ALL_WORKFLOW_QUEUES } from "../../../socket/queues";

interface UpdatePatientPayload {
  patientId: number;
  token_number?: string;
  name?: string;
  age?: number;
  gender?: string;
  mobile?: string;
  location_id?: number;
  new_location?: string;
  remarks?: string;
}

const updatePatient = async ({
  patientId,
  token_number,
  name,
  age,
  gender,
  mobile,
  location_id,
  new_location,
  remarks,
}: UpdatePatientPayload) => {
  if (!name) {
    throw new Error("Patient Name is required");
  }

  if (!token_number) {
    throw new Error("Token Number is required");
  }

  const existing = await pool.query(
    `SELECT id FROM patients WHERE token_number = $1 AND id != $2`,
    [token_number, patientId]
  );

  if (existing.rows.length) {
    throw new Error("Token already exists");
  }

  const resolvedLocationId = new_location
    ? await findOrCreateLocation(new_location)
    : location_id;

  const patient = await pool.query(
    `
    UPDATE patients
    SET
        token_number = $1,
        name = $2,
        age = $3,
        gender = $4,
        mobile = $5,
        location_id = $6,
        remark = $7,
        updated_at = now()
    WHERE id = $8
    RETURNING *
    `,
    [token_number, name, age, gender, mobile, resolvedLocationId, remarks, patientId]
  );

  if (!patient.rows.length) {
    throw new Error("Patient not found");
  }

  // The edited patient's current workflow stage isn't known here without an
  // extra query, and edits are infrequent — notify every room defensively so
  // whichever queue is currently showing this patient picks up the change.
  notifyQueueUpdated(...ALL_WORKFLOW_QUEUES);

  return patient.rows[0];
};

export default updatePatient;
