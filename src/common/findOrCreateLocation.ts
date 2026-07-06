import { pool } from "../db";

export const findOrCreateLocation = async (name: string) => {
  const trimmed = name.trim();

  // Atomic upsert avoids a race between two concurrent registrations that
  // both introduce the same brand-new address at the same time.
  const result = await pool.query(
    `
    INSERT INTO location (location)
    VALUES ($1)
    ON CONFLICT (location) DO UPDATE SET location = EXCLUDED.location
    RETURNING id
    `,
    [trimmed]
  );

  return result.rows[0].id;
};
