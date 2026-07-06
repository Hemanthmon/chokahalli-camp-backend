import { CHECKUP_STATUS } from "./constants";
import { pool } from "../db";

const PATIENT_QUEUE_COLUMNS = `
    p.id,
    p.token_number,
    p.name,
    p.age,
    p.gender,
    p.mobile,
    l.location,
    pc.status,
    p.created_at
`;

const PATIENT_QUEUE_JOIN = `
    FROM patients p

    INNER JOIN patient_checkups pc
        ON pc.patient_id = p.id

    LEFT JOIN location l
        ON l.id = p.location_id
`;

export const getWaitingPatientsByCheckup = async (checkupId: number) => {
  const patients = await pool.query(
    `
    SELECT ${PATIENT_QUEUE_COLUMNS}
    ${PATIENT_QUEUE_JOIN}
    WHERE
        pc.checkup_id = $1
        AND pc.status = ANY($2)

    ORDER BY CAST(p.token_number AS INTEGER) ASC
    `,
    [checkupId, [CHECKUP_STATUS.WAITING, CHECKUP_STATUS.ONGOING]]
  );

  return patients.rows;
};

export const getCompletedPatientsByCheckup = async (checkupId: number) => {
  const patients = await pool.query(
    `
    SELECT ${PATIENT_QUEUE_COLUMNS}
    ${PATIENT_QUEUE_JOIN}
    WHERE
        pc.checkup_id = $1
        AND pc.status = $2

    ORDER BY pc.completed_at DESC
    `,
    [checkupId, CHECKUP_STATUS.COMPLETED]
  );

  return patients.rows;
};

export const getPatientCheckupSummary = async (
  patientId: number,
  checkupId: number
) => {
  const patient = await pool.query(
    `
    SELECT
        p.id,
        p.token_number,
        p.name,
        p.age,
        p.gender,
        p.mobile,
        p.remark,
        l.location,
        pc.id AS patient_checkup_id,
        pc.status,
        p.created_at
    FROM patients p

    INNER JOIN patient_checkups pc
        ON pc.patient_id = p.id
        AND pc.checkup_id = $2

    LEFT JOIN location l
        ON l.id = p.location_id

    WHERE
        p.id = $1

    ORDER BY pc.id DESC
    LIMIT 1
    `,
    [patientId, checkupId]
  );

  return patient.rows[0] ?? null;
};
