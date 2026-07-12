import { CHECKUPS } from "../../../common/constants";
import { pool } from "../../../db";

// Re-scoped by mobile + token together (never by an internal id) so that
// even a guessed/leaked token number alone cannot pull a full record —
// this is the "second factor" the public portal relies on, supplied
// implicitly by the disambiguation step instead of typed manually.
const getPublicSpectacleStatus = async (mobile: string, tokenNumber: string) => {
  const result = await pool.query(
    `
    SELECT
        p.name,
        p.token_number,
        l.location AS address,
        sc.spectacle_status,
        vv.volunteer_name,
        vv.primary_phone AS volunteer_primary_phone,
        vv.secondary_phone AS volunteer_secondary_phone
    FROM patients p

    LEFT JOIN location l
        ON l.id = p.location_id

    LEFT JOIN patient_checkups pc
        ON pc.patient_id = p.id
        AND pc.checkup_id = $3

    LEFT JOIN spectacle_corrections sc
        ON sc.patient_checkup_id = pc.id

    -- Always the single active PRIMARY volunteer for the patient's village,
    -- never a list — "only one PRIMARY per village" is enforced when
    -- volunteers are created/updated, so at most one row can match here.
    LEFT JOIN village_volunteers vv
        ON vv.location_id = p.location_id
        AND vv.is_primary = true
        AND vv.active = true

    WHERE p.mobile = $1
      AND p.token_number = $2

    ORDER BY pc.id DESC
    LIMIT 1
    `,
    [mobile, tokenNumber, CHECKUPS.SPECTACLE_CORRECTION]
  );

  const row = result.rows[0];

  if (!row) {
    return null;
  }

  // No spectacle_corrections row at all means the assessment simply hasn't
  // been entered yet — this is an application-level state, never a status
  // value, and must be handled distinctly by the caller.
  return {
    name: row.name,
    token_number: row.token_number,
    address: row.address,
    has_record: row.spectacle_status !== null,
    spectacle_status: row.spectacle_status,
    volunteer_name: row.volunteer_name,
    volunteer_primary_phone: row.volunteer_primary_phone,
    volunteer_secondary_phone: row.volunteer_secondary_phone,
  };
};

export default getPublicSpectacleStatus;
