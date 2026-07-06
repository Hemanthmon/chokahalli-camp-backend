"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startCheckup = void 0;
const constants_1 = require("./constants");
const db_1 = require("../db");
const startCheckup = async (patientId, checkupId) => {
    const result = await db_1.pool.query(`
    UPDATE patient_checkups
    SET status = $1, started_at = now()
    WHERE patient_id = $2
      AND checkup_id = $3
      AND status = $4
    RETURNING id
    `, [constants_1.CHECKUP_STATUS.ONGOING, patientId, checkupId, constants_1.CHECKUP_STATUS.WAITING]);
    if (!result.rows.length) {
        throw new Error("This patient is already being attended to, or is not waiting for this stage.");
    }
    return result.rows[0];
};
exports.startCheckup = startCheckup;
