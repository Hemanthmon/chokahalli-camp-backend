"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../../common/constants");
const patientCheckupQueries_1 = require("../../../common/patientCheckupQueries");
const db_1 = require("../../../db");
const getNerveAssessmentPatientById = async (patientId) => {
    const patient = await (0, patientCheckupQueries_1.getPatientCheckupSummary)(patientId, constants_1.CHECKUPS.NERVE_ASSESSMENT);
    if (!patient) {
        return null;
    }
    const { patient_checkup_id, ...patientDetails } = patient;
    const assessment = await db_1.pool.query(`
    SELECT
        selected_for_operation,
        remarks,
        created_at,
        updated_at
    FROM nerve_assessments
    WHERE patient_checkup_id = $1
    ORDER BY id DESC
    LIMIT 1
    `, [patient_checkup_id]);
    return {
        ...patientDetails,
        nerve_assessment: assessment.rows[0] ?? null,
    };
};
exports.default = getNerveAssessmentPatientById;
