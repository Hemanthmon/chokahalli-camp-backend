"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../../../db");
const updateUserStatus = async ({ userId, active }) => {
    const user = await db_1.pool.query(`
    UPDATE users
    SET active = $1, updated_at = now()
    WHERE id = $2
    RETURNING id, name, phone, role, active, created_at, updated_at
    `, [active, userId]);
    if (!user.rows.length) {
        throw new Error("User not found");
    }
    return user.rows[0];
};
exports.default = updateUserStatus;
