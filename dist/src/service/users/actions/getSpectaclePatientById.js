"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../../common/constants");
const patientCheckupQueries_1 = require("../../../common/patientCheckupQueries");
const db_1 = require("../../../db");
const getSpectaclePatientById = async (patientId) => {
    const patient = await (0, patientCheckupQueries_1.getPatientCheckupSummary)(patientId, constants_1.CHECKUPS.SPECTACLE_CORRECTION);
    if (!patient) {
        return null;
    }
    const { patient_checkup_id, ...patientDetails } = patient;
    const correction = await db_1.pool.query(`
    SELECT
        left_eye,
        right_eye,
        spectacle_required,
        spectacle_status,
        remarks,
        created_at,
        updated_at
    FROM spectacle_corrections
    WHERE patient_checkup_id = $1
    ORDER BY id DESC
    LIMIT 1
    `, [patient_checkup_id]);
    return {
        ...patientDetails,
        spectacle_correction: correction.rows[0] ?? null,
    };
};
exports.default = getSpectaclePatientById;
