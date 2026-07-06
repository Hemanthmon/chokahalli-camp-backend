import { pool } from "../../../db";

const getActiveTests = async () => {
  const tests = await pool.query(
    `
    SELECT id, name
    FROM test_master
    WHERE is_active = TRUE
    ORDER BY name ASC
    `
  );

  return tests.rows;
};

export default getActiveTests;
