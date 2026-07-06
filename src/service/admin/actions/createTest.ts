import { pool } from "../../../db";

interface CreateTestPayload {
  name: string;
}

const createTest = async ({ name }: CreateTestPayload) => {
  if (!name?.trim()) {
    throw new Error("Test name is required");
  }

  const existing = await pool.query(
    `SELECT id FROM test_master WHERE name = $1`,
    [name.trim()]
  );

  if (existing.rows.length) {
    throw new Error("A test with this name already exists");
  }

  const test = await pool.query(
    `
    INSERT INTO test_master (name)
    VALUES ($1)
    RETURNING id, name, is_active, created_at, updated_at
    `,
    [name.trim()]
  );

  return test.rows[0];
};

export default createTest;
