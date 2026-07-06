import { pool } from "../../../db";

const listTests = async () => {
  const tests = await pool.query(
    `
    SELECT id, name, is_active, created_at, updated_at
    FROM test_master
    ORDER BY name ASC
    `
  );

  return tests.rows;
};

export default listTests;
