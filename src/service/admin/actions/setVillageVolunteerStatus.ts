import { pool } from "../../../db";

interface SetVillageVolunteerStatusPayload {
  volunteerId: number;
  active: boolean;
}

const setVillageVolunteerStatus = async ({
  volunteerId,
  active,
}: SetVillageVolunteerStatusPayload) => {
  const result = await pool.query(
    `
    UPDATE village_volunteers
    SET active = $1, updated_at = now()
    WHERE id = $2
    RETURNING *
    `,
    [active, volunteerId]
  );

  if (!result.rows.length) {
    throw new Error("Volunteer not found");
  }

  return result.rows[0];
};

export default setVillageVolunteerStatus;
