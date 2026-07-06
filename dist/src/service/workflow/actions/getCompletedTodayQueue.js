"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../../common/constants");
const db_1 = require("../../../db");
const getCompletedTodayQueue = async (checkupId) => {
    const patients = await db_1.pool.query(`
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
    `, [checkupId, constants_1.CHECKUP_STATUS.COMPLETED]);
    return patients.rows;
};
exports.default = getCompletedTodayQueue;
