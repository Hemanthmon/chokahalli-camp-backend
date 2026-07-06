"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../../../db");
const findOrCreateLocation_1 = require("../../../common/findOrCreateLocation");
const notifyQueueUpdated_1 = require("../../../socket/notifyQueueUpdated");
const queues_1 = require("../../../socket/queues");
const updatePatient = async ({ patientId, token_number, name, age, gender, mobile, location_id, new_location, remarks, }) => {
    if (!name) {
        throw new Error("Patient Name is required");
    }
    if (!token_number) {
        throw new Error("Token Number is required");
    }
    const existing = await db_1.pool.query(`SELECT id FROM patients WHERE token_number = $1 AND id != $2`, [token_number, patientId]);
    if (existing.rows.length) {
        throw new Error("Token already exists");
    }
    const resolvedLocationId = new_location
        ? await (0, findOrCreateLocation_1.findOrCreateLocation)(new_location)
        : location_id;
    const patient = await db_1.pool.query(`
    UPDATE patients
    SET
        token_number = $1,
        name = $2,
        age = $3,
        gender = $4,
        mobile = $5,
        location_id = $6,
        remark = $7,
        updated_at = now()
    WHERE id = $8
    RETURNING *
    `, [token_number, name, age, gender, mobile, resolvedLocationId, remarks, patientId]);
    if (!patient.rows.length) {
        throw new Error("Patient not found");
    }
    // The edited patient's current workflow stage isn't known here without an
    // extra query, and edits are infrequent — notify every room defensively so
    // whichever queue is currently showing this patient picks up the change.
    (0, notifyQueueUpdated_1.notifyQueueUpdated)(...queues_1.ALL_WORKFLOW_QUEUES);
    return patient.rows[0];
};
exports.default = updatePatient;
