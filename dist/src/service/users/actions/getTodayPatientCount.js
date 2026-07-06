"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../../../db");
const getTodayPatientCount = async () => {
    const result = await db_1.pool.query(`SELECT COUNT(*)::int AS count FROM patients WHERE created_at::date = CURRENT_DATE`);
    return result.rows[0].count;
};
exports.default = getTodayPatientCount;
