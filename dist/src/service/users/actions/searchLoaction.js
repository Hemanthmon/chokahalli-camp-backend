"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../../../db");
const searchLocation = async (search) => {
    const locations = await db_1.pool.query(`
    SELECT
        id,
        location
    FROM location
    WHERE (
        $1 = ''
        OR location ILIKE '%' || $1 || '%'
    )
    ORDER BY location
    LIMIT 20
    `, [search]);
    return locations.rows;
};
exports.default = searchLocation;
