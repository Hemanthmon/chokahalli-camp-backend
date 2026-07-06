"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findOrCreateLocation = void 0;
const db_1 = require("../db");
const findOrCreateLocation = async (name) => {
    const trimmed = name.trim();
    // Atomic upsert avoids a race between two concurrent registrations that
    // both introduce the same brand-new address at the same time.
    const result = await db_1.pool.query(`
    INSERT INTO location (location)
    VALUES ($1)
    ON CONFLICT (location) DO UPDATE SET location = EXCLUDED.location
    RETURNING id
    `, [trimmed]);
    return result.rows[0].id;
};
exports.findOrCreateLocation = findOrCreateLocation;
