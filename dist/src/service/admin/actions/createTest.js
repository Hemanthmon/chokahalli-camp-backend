"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../../../db");
const createTest = async ({ name }) => {
    if (!name?.trim()) {
        throw new Error("Test name is required");
    }
    const existing = await db_1.pool.query(`SELECT id FROM test_master WHERE name = $1`, [name.trim()]);
    if (existing.rows.length) {
        throw new Error("A test with this name already exists");
    }
    const test = await db_1.pool.query(`
    INSERT INTO test_master (name)
    VALUES ($1)
    RETURNING id, name, is_active, created_at, updated_at
    `, [name.trim()]);
    return test.rows[0];
};
exports.default = createTest;
