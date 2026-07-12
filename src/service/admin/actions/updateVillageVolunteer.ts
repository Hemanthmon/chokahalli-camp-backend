import { pool } from "../../../db";

interface UpdateVillageVolunteerPayload {
  volunteerId: number;
  volunteer_name?: string;
  primary_phone?: string;
  secondary_phone?: string;
  is_primary?: boolean;
}

const updateVillageVolunteer = async (payload: UpdateVillageVolunteerPayload) => {
  const {
    volunteerId,
    volunteer_name,
    primary_phone,
    secondary_phone,
    is_primary,
  } = payload;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const existing = await client.query(
      `SELECT location_id FROM village_volunteers WHERE id = $1`,
      [volunteerId]
    );

    if (!existing.rows.length) {
      throw new Error("Volunteer not found");
    }

    const { location_id: locationId } = existing.rows[0];

    // Village reassignment isn't supported here — only demote siblings when
    // this volunteer is being promoted to primary within their own village.
    if (is_primary) {
      await client.query(
        `UPDATE village_volunteers SET is_primary = false WHERE location_id = $1 AND id <> $2 AND is_primary = true`,
        [locationId, volunteerId]
      );
    }

    const result = await client.query(
      `
      UPDATE village_volunteers
      SET
          volunteer_name = COALESCE($1, volunteer_name),
          primary_phone = COALESCE($2, primary_phone),
          secondary_phone = COALESCE($3, secondary_phone),
          is_primary = COALESCE($4, is_primary),
          updated_at = now()
      WHERE id = $5
      RETURNING *
      `,
      [
        volunteer_name?.trim(),
        primary_phone?.trim(),
        secondary_phone?.trim(),
        is_primary,
        volunteerId,
      ]
    );

    await client.query("COMMIT");

    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export default updateVillageVolunteer;
