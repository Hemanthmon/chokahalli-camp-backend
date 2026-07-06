import type { PoolClient } from "pg";

export const findPatientCheckup = async (
  client: Pick<PoolClient, "query">,
  patientId: number,
  checkupId: number
) => {
  const result = await client.query(
    `
    SELECT id, status FROM patient_checkups
    WHERE patient_id = $1
      AND checkup_id = $2
    ORDER BY id DESC
    LIMIT 1
    `,
    [patientId, checkupId]
  );

  return result.rows[0] ?? null;
};
