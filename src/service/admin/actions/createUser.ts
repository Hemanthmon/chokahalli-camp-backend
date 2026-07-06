import { ROLES } from "../../../common/constants";
import { pool } from "../../../db";

interface CreateUserPayload {
  name: string;
  phone: string;
  role: string;
}

const createUser = async ({ name, phone, role }: CreateUserPayload) => {
  if (!name) {
    throw new Error("Name is required");
  }

  if (!phone) {
    throw new Error("Phone Number is required");
  }

  if (!Object.values(ROLES).includes(role as (typeof ROLES)[keyof typeof ROLES])) {
    throw new Error("A valid role is required");
  }

  const existing = await pool.query(`SELECT id FROM users WHERE phone = $1`, [
    phone,
  ]);

  if (existing.rows.length) {
    throw new Error("A user with this phone number already exists");
  }

  const user = await pool.query(
    `
    INSERT INTO users (name, phone, role, active)
    VALUES ($1, $2, $3, true)
    RETURNING id, name, phone, role, active, created_at, updated_at
    `,
    [name, phone, role]
  );

  return user.rows[0];
};

export default createUser;
