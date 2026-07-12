import { ROLES } from "../../../common/constants";
import { signToken } from "../../../common/jwt";
import { verifyPassword } from "../../../common/passwordAuth";
import { pool } from "../../../db";

const verifyAdminPassword = async (phone: string, password: string) => {
  if (!phone || !password) {
    throw new Error("Phone number and password are required");
  }

  const result = await pool.query(
    `SELECT id, name, phone, role, active, password_hash FROM users WHERE phone = $1 AND role = $2`,
    [phone, ROLES.ADMIN]
  );

  const user = result.rows[0];

  // Same generic message regardless of which condition actually failed —
  // this endpoint shouldn't leak account state beyond what step 1 (which
  // is already gated on the account existing and being active) revealed.
  if (!user || !user.active || !user.password_hash) {
    throw new Error("Invalid phone number or password");
  }

  const isValid = await verifyPassword(password, user.password_hash);

  if (!isValid) {
    throw new Error("Invalid phone number or password");
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

export default verifyAdminPassword;
