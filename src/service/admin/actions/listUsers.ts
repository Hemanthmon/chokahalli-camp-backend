import { pool } from "../../../db";

const listUsers = async () => {
  const users = await pool.query(
    `
    SELECT id, name, phone, role, active, created_at, updated_at
    FROM users
    ORDER BY created_at DESC
    `
  );

  return users.rows;
};

export default listUsers;
