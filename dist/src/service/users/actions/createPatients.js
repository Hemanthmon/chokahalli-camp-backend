"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../../common/constants");
const patientCheckUp_1 = require("../../../common/patientCheckUp");
const findOrCreateLocation_1 = require("../../../common/findOrCreateLocation");
const db_1 = require("../../../db");
const notifyQueueUpdated_1 = require("../../../socket/notifyQueueUpdated");
const queues_1 = require("../../../socket/queues");
const createPatient = async (payload) => {
    const { token_number, name, age, gender, mobile, location_id, new_location, remarks } = payload;
    if (!token_number) {
        throw new Error("Token Number is required");
    }
    if (!name) {
        throw new Error("Patient Name is required");
    }
    const existing = await db_1.pool.query(`SELECT id FROM patients WHERE token_number = $1`, [token_number]);
    if (existing.rows.length) {
        throw new Error("Token already exists");
    }
    const resolvedLocationId = new_location
        ? await (0, findOrCreateLocation_1.findOrCreateLocation)(new_location)
        : location_id;
    const patient = await db_1.pool.query(`
    INSERT INTO patients
    (
        token_number,
        name,
        age,
        gender,
        mobile,
        location_id,
        remark,
        status
    )
    VALUES
    (
        $1,$2,$3,$4,$5,$6,$7,$8
    )
    RETURNING *
    `, [
        token_number,
        name,
        age,
        gender,
        mobile,
        resolvedLocationId,
        remarks,
        "ACTIVE"
    ]);
    const patientId = patient.rows[0].id;
    await (0, patientCheckUp_1.createPatientCheckup)({
        patientId,
        checkupId: constants_1.CHECKUPS.REGISTRATION,
        status: constants_1.CHECKUP_STATUS.COMPLETED
    });
    await (0, patientCheckUp_1.createPatientCheckup)({
        patientId,
        checkupId: constants_1.CHECKUPS.SPECTACLE_CORRECTION,
        status: constants_1.CHECKUP_STATUS.WAITING
    });
    (0, notifyQueueUpdated_1.notifyQueueUpdated)(queues_1.WORKFLOW_QUEUES.PATIENTS, queues_1.WORKFLOW_QUEUES.SPECTACLE_CORRECTION, queues_1.WORKFLOW_QUEUES.DASHBOARD);
    return patient.rows[0];
};
exports.default = createPatient;
