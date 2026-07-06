import { pool } from "../../../db";

const getTodayPatientCount = async () => {
  const result = await pool.query(
    `SELECT COUNT(*)::int AS count FROM patients WHERE created_at::date = CURRENT_DATE`
  );

  return result.rows[0].count;
};

export default getTodayPatientCount;
