import { CHECKUP_STATUS } from "./constants";
import { pool } from "../db";

export const startCheckup = async (patientId: number, checkupId: number) => {
  const result = await pool.query(
    `
    UPDATE patient_checkups
    SET status = $1, started_at = now()
    WHERE patient_id = $2
      AND checkup_id = $3
      AND status = $4
    RETURNING id
    `,
    [CHECKUP_STATUS.ONGOING, patientId, checkupId, CHECKUP_STATUS.WAITING]
  );

  if (!result.rows.length) {
    throw new Error(
      "This patient is already being attended to, or is not waiting for this stage."
    );
  }

  return result.rows[0];
};
