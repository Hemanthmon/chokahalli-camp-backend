"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../../../db");
const getRecentPatients = async (limit = 5) => {
    const patients = await db_1.pool.query(`
    SELECT
        p.id,
        p.token_number,
        p.name,
        p.age,
        p.gender,
        l.location,
        p.created_at
    FROM patients p

    LEFT JOIN location l
        ON l.id = p.location_id

    ORDER BY p.created_at DESC
    LIMIT $1
    `, [limit]);
    return patients.rows;
};
exports.default = getRecentPatients;
