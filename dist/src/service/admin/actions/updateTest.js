"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../../../db");
const updateTest = async ({ testId, name }) => {
    if (!name?.trim()) {
        throw new Error("Test name is required");
    }
    const existing = await db_1.pool.query(`SELECT id FROM test_master WHERE name = $1 AND id != $2`, [name.trim(), testId]);
    if (existing.rows.length) {
        throw new Error("A test with this name already exists");
    }
    const test = await db_1.pool.query(`
    UPDATE test_master
    SET name = $1, updated_at = now()
    WHERE id = $2
    RETURNING id, name, is_active, created_at, updated_at
    `, [name.trim(), testId]);
    if (!test.rows.length) {
        throw new Error("Test not found");
    }
    return test.rows[0];
};
exports.default = updateTest;
