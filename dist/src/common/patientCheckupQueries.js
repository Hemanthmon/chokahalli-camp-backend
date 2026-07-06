"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPatientCheckupSummary = exports.getCompletedPatientsByCheckup = exports.getWaitingPatientsByCheckup = void 0;
const constants_1 = require("./constants");
const db_1 = require("../db");
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
const getWaitingPatientsByCheckup = async (checkupId) => {
    const patients = await db_1.pool.query(`
    SELECT ${PATIENT_QUEUE_COLUMNS}
    ${PATIENT_QUEUE_JOIN}
    WHERE
        pc.checkup_id = $1
        AND pc.status = ANY($2)

    ORDER BY CAST(p.token_number AS INTEGER) ASC
    `, [checkupId, [constants_1.CHECKUP_STATUS.WAITING, constants_1.CHECKUP_STATUS.ONGOING]]);
    return patients.rows;
};
exports.getWaitingPatientsByCheckup = getWaitingPatientsByCheckup;
const getCompletedPatientsByCheckup = async (checkupId) => {
    const patients = await db_1.pool.query(`
    SELECT ${PATIENT_QUEUE_COLUMNS}
    ${PATIENT_QUEUE_JOIN}
    WHERE
        pc.checkup_id = $1
        AND pc.status = $2

    ORDER BY pc.completed_at DESC
    `, [checkupId, constants_1.CHECKUP_STATUS.COMPLETED]);
    return patients.rows;
};
exports.getCompletedPatientsByCheckup = getCompletedPatientsByCheckup;
const getPatientCheckupSummary = async (patientId, checkupId) => {
    const patient = await db_1.pool.query(`
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
    `, [patientId, checkupId]);
    return patient.rows[0] ?? null;
};
exports.getPatientCheckupSummary = getPatientCheckupSummary;
