import { pool } from "../../../db";

const getQueueByStatus = async (checkupId: number, status: string) => {
  const patients = await pool.query(
    `
    SELECT
        p.id,
        p.token_number,
        p.name,
        p.age,
        p.gender,
        p.mobile,
        l.location,
        pc.status,
        p.created_at
    FROM patients p

    INNER JOIN patient_checkups pc
        ON pc.patient_id = p.id

    LEFT JOIN location l
        ON l.id = p.location_id

    WHERE
        pc.checkup_id = $1
        AND pc.status = $2

    ORDER BY CAST(p.token_number AS INTEGER) ASC
    `,
    [checkupId, status]
  );

  return patients.rows;
};

export default getQueueByStatus;
