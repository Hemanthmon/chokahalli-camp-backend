"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../../../db");
const getActiveTests = async () => {
    const tests = await db_1.pool.query(`
    SELECT id, name
    FROM test_master
    WHERE is_active = TRUE
    ORDER BY name ASC
    `);
    return tests.rows;
};
exports.default = getActiveTests;
