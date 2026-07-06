"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../../common/constants");
const db_1 = require("../../../db");
const createUser = async ({ name, phone, role }) => {
    if (!name) {
        throw new Error("Name is required");
    }
    if (!phone) {
        throw new Error("Phone Number is required");
    }
    if (!Object.values(constants_1.ROLES).includes(role)) {
        throw new Error("A valid role is required");
    }
    const existing = await db_1.pool.query(`SELECT id FROM users WHERE phone = $1`, [
        phone,
    ]);
    if (existing.rows.length) {
        throw new Error("A user with this phone number already exists");
    }
    const user = await db_1.pool.query(`
    INSERT INTO users (name, phone, role, active)
    VALUES ($1, $2, $3, true)
    RETURNING id, name, phone, role, active, created_at, updated_at
    `, [name, phone, role]);
    return user.rows[0];
};
exports.default = createUser;
