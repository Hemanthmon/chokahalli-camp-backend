"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../../common/constants");
const db_1 = require("../../../db");
const getStageDetails = async (checkupId, patientCheckupId) => {
    switch (checkupId) {
        case constants_1.CHECKUPS.SPECTACLE_CORRECTION: {
            const result = await db_1.pool.query(`
        SELECT left_eye, right_eye, spectacle_required, spectacle_status, remarks, created_at, updated_at
        FROM spectacle_corrections
        WHERE patient_checkup_id = $1
        ORDER BY id DESC
        LIMIT 1
        `, [patientCheckupId]);
            return result.rows[0] ?? null;
        }
        case constants_1.CHECKUPS.SLIT_LAMP_CHECKUP: {
            const result = await db_1.pool.query(`
        SELECT cataract_present, affected_eye, medicine_given, proceed_to_nerve, remarks, created_at, updated_at
        FROM slit_lamp_checkups
        WHERE patient_checkup_id = $1
        ORDER BY id DESC
        LIMIT 1
        `, [patientCheckupId]);
            return result.rows[0] ?? null;
        }
        case constants_1.CHECKUPS.NERVE_ASSESSMENT: {
            const result = await db_1.pool.query(`
        SELECT selected_for_operation, remarks, created_at, updated_at
        FROM nerve_assessments
        WHERE patient_checkup_id = $1
        ORDER BY id DESC
        LIMIT 1
        `, [patientCheckupId]);
            return result.rows[0] ?? null;
        }
        case constants_1.CHECKUPS.BP_SUGAR_TEST: {
            const result = await db_1.pool.query(`
        SELECT id, bp, blood_sugar, remarks, created_at, updated_at
        FROM bp_sugar_tests
        WHERE patient_checkup_id = $1
        ORDER BY id DESC
        LIMIT 1
        `, [patientCheckupId]);
            const row = result.rows[0];
            if (!row) {
                return null;
            }
            const items = await db_1.pool.query(`
        SELECT tm.name
        FROM bp_sugar_test_items bsi
        INNER JOIN test_master tm ON tm.id = bsi.test_id
        WHERE bsi.bp_sugar_test_id = $1
        `, [row.id]);
            return {
                bp: row.bp,
                blood_sugar: row.blood_sugar,
                remarks: row.remarks,
                test_names: items.rows.map((item) => item.name),
                created_at: row.created_at,
                updated_at: row.updated_at,
            };
        }
        case constants_1.CHECKUPS.OPERATION_RECOMMENDATION: {
            const result = await db_1.pool.query(`
        SELECT operation_status, operation_type, remarks, created_at, updated_at
        FROM operation_recommendations
        WHERE patient_checkup_id = $1
        ORDER BY id DESC
        LIMIT 1
        `, [patientCheckupId]);
            return result.rows[0] ?? null;
        }
        default:
            return null;
    }
};
const getPatientTimeline = async (patientId) => {
    const patientResult = await db_1.pool.query(`
    SELECT
        p.id,
        p.token_number,
        p.name,
        p.age,
        p.gender,
        p.mobile,
        p.remark,
        p.status,
        l.location,
        p.created_at
    FROM patients p
    LEFT JOIN location l ON l.id = p.location_id
    WHERE p.id = $1
    `, [patientId]);
    const patient = patientResult.rows[0];
    if (!patient) {
        return null;
    }
    const stagesResult = await db_1.pool.query(`
    SELECT
        pc.id AS patient_checkup_id,
        pc.checkup_id,
        c.name AS checkup_name,
        c.sequence,
        pc.status,
        pc.remarks,
        pc.started_at,
        pc.completed_at
    FROM patient_checkups pc
    INNER JOIN checkups c ON c.id = pc.checkup_id
    WHERE pc.patient_id = $1
    ORDER BY c.sequence ASC, pc.id ASC
    `, [patientId]);
    const stages = await Promise.all(stagesResult.rows.map(async (stage) => ({
        checkup_id: stage.checkup_id,
        checkup_name: stage.checkup_name,
        sequence: stage.sequence,
        status: stage.status,
        remarks: stage.remarks,
        started_at: stage.started_at,
        completed_at: stage.completed_at,
        details: stage.status === constants_1.CHECKUP_STATUS.SKIPPED
            ? null
            : await getStageDetails(stage.checkup_id, stage.patient_checkup_id),
    })));
    return {
        ...patient,
        stages,
    };
};
exports.default = getPatientTimeline;
