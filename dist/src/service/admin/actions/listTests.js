"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../../../db");
const listTests = async () => {
    const tests = await db_1.pool.query(`
    SELECT id, name, is_active, created_at, updated_at
    FROM test_master
    ORDER BY name ASC
    `);
    return tests.rows;
};
exports.default = listTests;
