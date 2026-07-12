import { CHECKUPS } from "../../../common/constants";
import { pool } from "../../../db";

const getSpectacleDistributionList = async () => {
  const result = await pool.query(
    `
    SELECT
        p.id,
        p.token_number,
        p.name,
        p.mobile,
        l.location AS address,
        sc.spectacle_status
    FROM spectacle_corrections sc

    INNER JOIN patient_checkups pc
        ON pc.id = sc.patient_checkup_id
        AND pc.checkup_id = $1

    INNER JOIN patients p
        ON p.id = pc.patient_id

    LEFT JOIN location l
        ON l.id = p.location_id

    WHERE sc.spectacle_required = true

    ORDER BY CAST(p.token_number AS INTEGER) ASC
    `,
    [CHECKUPS.SPECTACLE_CORRECTION]
  );

  return result.rows;
};

export default getSpectacleDistributionList;
