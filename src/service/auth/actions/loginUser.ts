import { AUTH_STEP, ROLES } from "../../../common/constants";
import { signToken } from "../../../common/jwt";
import { pool } from "../../../db";

// Step 1 of every login, ADMIN included. Non-ADMIN roles are issued a
// token immediately here, exactly as before. ADMIN never gets a token
// from this step — it only reports what the client must do next
// (verifyAdminPassword or setAdminPassword), keeping this the one entry
// point the frontend always posts a phone number to first.
const loginUser = async (phone: string) => {
  if (!phone) {
    throw new Error("Phone number is required");
  }

  const result = await pool.query(
    `SELECT id, name, phone, role, active, password_hash FROM users WHERE phone = $1`,
    [phone]
  );

  const user = result.rows[0];

  if (!user) {
    throw new Error("No account found for this phone number");
  }

  if (!user.active) {
    throw new Error("This account has been deactivated");
  }

  if (user.role === ROLES.ADMIN) {
    return {
      authStep: user.password_hash
        ? AUTH_STEP.PASSWORD_REQUIRED
        : AUTH_STEP.PASSWORD_SETUP_REQUIRED,
      name: user.name,
      phone: user.phone,
    };
  }

  const token = signToken({
    id: user.id,
    name: user.name,
    phone: user.phone,
    role: user.role,
  });

  return {
    authStep: AUTH_STEP.NONE,
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
