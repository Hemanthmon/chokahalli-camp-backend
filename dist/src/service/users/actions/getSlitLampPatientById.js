"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../../common/constants");
const patientCheckupQueries_1 = require("../../../common/patientCheckupQueries");
const db_1 = require("../../../db");
const getSlitLampPatientById = async (patientId) => {
    const patient = await (0, patientCheckupQueries_1.getPatientCheckupSummary)(patientId, constants_1.CHECKUPS.SLIT_LAMP_CHECKUP);
    if (!patient) {
        return null;
    }
    const { patient_checkup_id, ...patientDetails } = patient;
    const checkup = await db_1.pool.query(`
    SELECT
        cataract_present,
        affected_eye,
        medicine_given,
        proceed_to_nerve,
        remarks,
        created_at,
        updated_at
    FROM slit_lamp_checkups
    WHERE patient_checkup_id = $1
    ORDER BY id DESC
    LIMIT 1
    `, [patient_checkup_id]);
    return {
        ...patientDetails,
        slit_lamp_checkup: checkup.rows[0] ?? null,
    };
};
exports.default = getSlitLampPatientById;
