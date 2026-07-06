"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../../../db");
const listUsers = async () => {
    const users = await db_1.pool.query(`
    SELECT id, name, phone, role, active, created_at, updated_at
    FROM users
    ORDER BY created_at DESC
    `);
    return users.rows;
};
exports.default = listUsers;
