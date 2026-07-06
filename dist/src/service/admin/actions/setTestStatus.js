"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../../../db");
const setTestStatus = async ({ testId, isActive }) => {
    const test = await db_1.pool.query(`
    UPDATE test_master
    SET is_active = $1, updated_at = now()
    WHERE id = $2
    RETURNING id, name, is_active, created_at, updated_at
    `, [isActive, testId]);
    if (!test.rows.length) {
        throw new Error("Test not found");
    }
    return test.rows[0];
};
exports.default = setTestStatus;
