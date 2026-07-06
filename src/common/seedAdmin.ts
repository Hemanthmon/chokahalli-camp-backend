import { ROLES } from "./constants";
import { pool } from "../db";

export const seedAdmin = async () => {
  const name = process.env.SEED_ADMIN_NAME;
  const phone = process.env.SEED_ADMIN_PHONE;

  if (!name || !phone || name === "CHANGE_ME" || phone === "CHANGE_ME") {
    console.warn(
      "⚠️  SEED_ADMIN_NAME / SEED_ADMIN_PHONE not set — skipping admin bootstrap"
    );
    return;
  }

  const existingAdmin = await pool.query(
    `SELECT id FROM users WHERE role = $1 LIMIT 1`,
    [ROLES.ADMIN]
  );

  if (existingAdmin.rows.length) {
    return;
  }

  const existingPhone = await pool.query(
    `SELECT id FROM users WHERE phone = $1`,
    [phone]
  );

  if (existingPhone.rows.length) {
    await pool.query(
      `UPDATE users SET role = $1, active = true WHERE phone = $2`,
      [ROLES.ADMIN, phone]
    );
    console.log(`✅ Promoted existing user (${phone}) to ADMIN`);
    return;
  }

  await pool.query(
    `INSERT INTO users (name, phone, role, active) VALUES ($1, $2, $3, true)`,
    [name, phone, ROLES.ADMIN]
  );

  console.log(`✅ Seeded first ADMIN user: ${name} (${phone})`);
};
