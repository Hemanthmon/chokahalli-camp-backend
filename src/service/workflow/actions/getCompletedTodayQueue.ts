import { CHECKUP_STATUS } from "../../../common/constants";
import { pool } from "../../../db";

const getCompletedTodayQueue = async (checkupId: number) => {
  const patients = await pool.query(
    `
    SELECT
        p.id,
        p.token_number,
        p.name,
        p.age,
        p.gender,
        p.mobile,
        l.location,
        pc.status,
        pc.completed_at,
        p.created_at
    FROM patients p

    INNER JOIN patient_checkups pc
        ON pc.patient_id = p.id

    LEFT JOIN location l
        ON l.id = p.location_id

    WHERE
        pc.checkup_id = $1
        AND pc.status = $2
        AND pc.completed_at::date = CURRENT_DATE

    ORDER BY pc.completed_at DESC
    `,
    [checkupId, CHECKUP_STATUS.COMPLETED]
  );

  return patients.rows;
};

export default getCompletedTodayQueue;
