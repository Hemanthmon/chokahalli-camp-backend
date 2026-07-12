import { ROLES } from "../../../common/constants";
import { signToken } from "../../../common/jwt";
import { hashPassword, validatePasswordStrength } from "../../../common/passwordAuth";
import { pool } from "../../../db";

const setAdminPassword = async (
  phone: string,
  password: string,
  confirmPassword: string
) => {
  if (!phone || !password || !confirmPassword) {
    throw new Error("Phone number and password are required");
  }

  if (password !== confirmPassword) {
    throw new Error("Passwords do not match");
  }

  const strengthErrors = validatePasswordStrength(password);

  if (strengthErrors.length) {
    throw new Error(strengthErrors.join(" "));
  }

  const result = await pool.query(
    `SELECT id, name, phone, role, active, password_hash FROM users WHERE phone = $1 AND role = $2`,
    [phone, ROLES.ADMIN]
  );

  const user = result.rows[0];

  if (!user || !user.active) {
    throw new Error("No account found for this phone number");
  }

  if (user.password_hash) {
    // This endpoint only ever claims a blank password — it never
    // overwrites an existing one. That's deliberately left for a future
    // "forgot password" flow, once it verifies identity first.
    throw new Error("A password has already been set for this account");
  }

  const hash = await hashPassword(password);

  await pool.query(`UPDATE users SET password_hash = $1 WHERE id = $2`, [
    hash,
    user.id,
  ]);

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

export default setAdminPassword;
