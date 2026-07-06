import { pool } from "../../../db";

const getAllPatients = async () => {
  const patients = await pool.query(
    `
    SELECT
        p.id,
        p.token_number,
        p.name,
        p.age,
        p.gender,
        p.mobile,
        p.remark,
        l.location,
        p.location_id,
        p.created_at,
        stage.name AS current_stage,
        stage.status AS current_status
    FROM patients p

    LEFT JOIN location l
        ON l.id = p.location_id

    LEFT JOIN LATERAL (
        SELECT c.name, pc.status
        FROM patient_checkups pc
        INNER JOIN checkups c ON c.id = pc.checkup_id
        WHERE pc.patient_id = p.id
          AND pc.status != 'SKIPPED'
        ORDER BY c.sequence DESC
        LIMIT 1
    ) stage ON true

    ORDER BY p.created_at DESC
    `
  );

  return patients.rows;
};

export default getAllPatients;
