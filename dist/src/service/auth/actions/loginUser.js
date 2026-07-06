"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jwt_1 = require("../../../common/jwt");
const db_1 = require("../../../db");
const loginUser = async (phone) => {
    if (!phone) {
        throw new Error("Phone number is required");
    }
    const result = await db_1.pool.query(`SELECT id, name, phone, role, active FROM users WHERE phone = $1`, [phone]);
    const user = result.rows[0];
    if (!user) {
        throw new Error("No account found for this phone number");
    }
    if (!user.active) {
        throw new Error("This account has been deactivated");
    }
    const token = (0, jwt_1.signToken)({
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
    });
    return {
        token,
        user: {
            id: user.id,
            name: user.name,
            phone: user.phone,
            role: user.role,
        },
    };
};
exports.default = loginUser;
