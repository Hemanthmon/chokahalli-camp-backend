import { signToken } from "../../../common/jwt";
import { pool } from "../../../db";

const loginUser = async (phone: string) => {
  if (!phone) {
    throw new Error("Phone number is required");
  }

  const result = await pool.query(
    `SELECT id, name, phone, role, active FROM users WHERE phone = $1`,
    [phone]
  );

  const user = result.rows[0];

  if (!user) {
    throw new Error("No account found for this phone number");
  }

  if (!user.active) {
    throw new Error("This account has been deactivated");
  }

  const token = signToken({
    id: user.id,
    name: user.name,
    phone: user.phone,
    role: user.role,
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      phone: user.phone,
      role: user.role,
    },
  };
};

export default loginUser;
