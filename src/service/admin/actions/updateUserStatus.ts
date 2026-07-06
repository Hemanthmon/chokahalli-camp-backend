import { pool } from "../../../db";

interface UpdateUserStatusPayload {
  userId: number;
  active: boolean;
}

const updateUserStatus = async ({ userId, active }: UpdateUserStatusPayload) => {
  const user = await pool.query(
    `
    UPDATE users
    SET active = $1, updated_at = now()
    WHERE id = $2
    RETURNING id, name, phone, role, active, created_at, updated_at
    `,
    [active, userId]
  );

  if (!user.rows.length) {
    throw new Error("User not found");
  }

  return user.rows[0];
};

export default updateUserStatus;
