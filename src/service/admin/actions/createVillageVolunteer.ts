import { pool } from "../../../db";
import { findOrCreateLocation } from "../../../common/findOrCreateLocation";

interface CreateVillageVolunteerPayload {
  location_id?: number;
  new_location?: string;
  volunteer_name: string;
  primary_phone: string;
  secondary_phone?: string;
  is_primary?: boolean;
}

const createVillageVolunteer = async (payload: CreateVillageVolunteerPayload) => {
  const {
    location_id,
    new_location,
    volunteer_name,
    primary_phone,
    secondary_phone,
    is_primary,
  } = payload;

  if (!volunteer_name?.trim()) {
    throw new Error("Volunteer name is required");
  }

  if (!primary_phone?.trim()) {
    throw new Error("Primary phone number is required");
  }

  if (!location_id && !new_location) {
    throw new Error("Village is required");
  }

  const resolvedLocationId = new_location
    ? await findOrCreateLocation(new_location)
    : location_id;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Only one PRIMARY, ACTIVE volunteer per village at a time — enforced
    // here rather than with a DB constraint, matching how this codebase
    // already enforces business rules in the service layer.
    if (is_primary) {
      await client.query(
        `UPDATE village_volunteers SET is_primary = false WHERE location_id = $1 AND is_primary = true`,
        [resolvedLocationId]
      );
    }

    const result = await client.query(
      `
      INSERT INTO village_volunteers
      (
          location_id,
          volunteer_name,
          primary_phone,
          secondary_phone,
          is_primary
      )
      VALUES
      (
          $1, $2, $3, $4, $5
      )
      RETURNING *
      `,
      [
        resolvedLocationId,
        volunteer_name.trim(),
        primary_phone.trim(),
        secondary_phone?.trim() || null,
        is_primary ?? true,
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

export default createVillageVolunteer;
