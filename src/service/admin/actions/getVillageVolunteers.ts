import { pool } from "../../../db";

const getVillageVolunteers = async () => {
  const result = await pool.query(
    `
    SELECT
        v.id,
        v.location_id,
        l.location AS village,
        v.volunteer_name,
        v.primary_phone,
        v.secondary_phone,
        v.is_primary,
        v.active,
        v.created_at,
        v.updated_at
    FROM village_volunteers v
    INNER JOIN location l ON l.id = v.location_id
    ORDER BY l.location ASC, v.is_primary DESC, v.volunteer_name ASC
    `
  );

  return result.rows;
};

export default getVillageVolunteers;
