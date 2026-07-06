import type { PoolClient } from "pg";
import { pool } from "../db";

interface CreatePatientCheckupPayload {
  patientId: number;
  checkupId: number;
  status: string;
}

export const createPatientCheckup = async (
  { patientId, checkupId, status }: CreatePatientCheckupPayload,
  client: Pick<PoolClient, "query"> = pool
) => {
  await client.query(
    `
    INSERT INTO patient_checkups
    (
      patient_id,
      checkup_id,
      status
    )
    VALUES
    (
      $1,
      $2,
      $3
    )
    `,
    [patientId, checkupId, status]
  );
};