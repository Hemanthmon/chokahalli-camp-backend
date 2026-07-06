"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../../common/constants");
const patientCheckUp_1 = require("../../../common/patientCheckUp");
const findPatientCheckup_1 = require("../../../common/findPatientCheckup");
const db_1 = require("../../../db");
const notifyQueueUpdated_1 = require("../../../socket/notifyQueueUpdated");
const queues_1 = require("../../../socket/queues");
const saveSlitLampCheckup = async (payload) => {
    const { patient_id, cataract_present, affected_eye, medicine_given, proceed_to_nerve, remarks, } = payload;
    if (!patient_id) {
        throw new Error("Patient is required");
    }
    if (cataract_present === undefined || cataract_present === null) {
        throw new Error("Cataract Present is required");
    }
    const client = await db_1.pool.connect();
    try {
        await client.query("BEGIN");
        const checkupRecord = await (0, findPatientCheckup_1.findPatientCheckup)(client, patient_id, constants_1.CHECKUPS.SLIT_LAMP_CHECKUP);
        if (!checkupRecord) {
            throw new Error("No slit lamp checkup found for this patient");
        }
        if (checkupRecord.status === constants_1.CHECKUP_STATUS.SKIPPED) {
            throw new Error("This stage was skipped for this patient");
        }
        const patientCheckupId = checkupRecord.id;
        const existing = await client.query(`SELECT id, proceed_to_nerve FROM slit_lamp_checkups WHERE patient_checkup_id = $1`, [patientCheckupId]);
        const isFirstSave = !existing.rows.length;
        const previousProceedToNerve = existing.rows[0]?.proceed_to_nerve ?? null;
        const checkup = isFirstSave
            ? await client.query(`
          INSERT INTO slit_lamp_checkups
          (
              patient_checkup_id,
              cataract_present,
              affected_eye,
              medicine_given,
              proceed_to_nerve,
              remarks
          )
          VALUES
          (
              $1, $2, $3, $4, $5, $6
          )
          RETURNING *
          `, [
                patientCheckupId,
                cataract_present,
                affected_eye,
                medicine_given ?? false,
                proceed_to_nerve ?? false,
                remarks,
            ])
            : await client.query(`
          UPDATE slit_lamp_checkups
          SET
              cataract_present = $1,
              affected_eye = $2,
              medicine_given = $3,
              proceed_to_nerve = $4,
              remarks = $5,
              updated_at = now()
          WHERE patient_checkup_id = $6
          RETURNING *
          `, [
                cataract_present,
                affected_eye,
                medicine_given ?? false,
                proceed_to_nerve ?? false,
                remarks,
                patientCheckupId,
            ]);
        if (isFirstSave) {
            await client.query(`
        UPDATE patient_checkups
        SET status = $1, completed_at = now()
        WHERE id = $2
        `, [constants_1.CHECKUP_STATUS.COMPLETED, patientCheckupId]);
            if (proceed_to_nerve) {
                await (0, patientCheckUp_1.createPatientCheckup)({
                    patientId: patient_id,
                    checkupId: constants_1.CHECKUPS.NERVE_ASSESSMENT,
                    status: constants_1.CHECKUP_STATUS.WAITING,
                }, client);
            }
            else {
                await (0, patientCheckUp_1.createPatientCheckup)({
                    patientId: patient_id,
                    checkupId: constants_1.CHECKUPS.NERVE_ASSESSMENT,
                    status: constants_1.CHECKUP_STATUS.SKIPPED,
                }, client);
                await (0, patientCheckUp_1.createPatientCheckup)({
                    patientId: patient_id,
                    checkupId: constants_1.CHECKUPS.BP_SUGAR_TEST,
                    status: constants_1.CHECKUP_STATUS.SKIPPED,
                }, client);
                await (0, patientCheckUp_1.createPatientCheckup)({
                    patientId: patient_id,
                    checkupId: constants_1.CHECKUPS.OPERATION_RECOMMENDATION,
                    status: constants_1.CHECKUP_STATUS.SKIPPED,
                }, client);
                await client.query(`
          UPDATE patients
          SET status = $1, updated_at = now()
          WHERE id = $2
          `, [constants_1.CHECKUP_STATUS.COMPLETED, patient_id]);
            }
        }
        else if (previousProceedToNerve === false && proceed_to_nerve === true) {
            // The doctor is editing an already-completed exam and has changed the
            // decision from No to Yes. Re-open Nerve Assessment, but only if
            // nothing has happened on it yet (still SKIPPED) — if it's already
            // WAITING/ONGOING/COMPLETED, something already occurred downstream
            // and silently rewriting it here could hide real recorded work, so
            // we leave it alone in that case.
            const nerveCheckup = await (0, findPatientCheckup_1.findPatientCheckup)(client, patient_id, constants_1.CHECKUPS.NERVE_ASSESSMENT);
            if (nerveCheckup && nerveCheckup.status === constants_1.CHECKUP_STATUS.SKIPPED) {
                await client.query(`
          UPDATE patient_checkups
          SET status = $1, completed_at = NULL
          WHERE id = $2
          `, [constants_1.CHECKUP_STATUS.WAITING, nerveCheckup.id]);
                await client.query(`
          UPDATE patients
          SET status = $1, updated_at = now()
          WHERE id = $2
          `, ["ACTIVE", patient_id]);
            }
        }
        await client.query("COMMIT");
        if (proceed_to_nerve) {
            (0, notifyQueueUpdated_1.notifyQueueUpdated)(queues_1.WORKFLOW_QUEUES.SLIT_LAMP, queues_1.WORKFLOW_QUEUES.NERVE_ASSESSMENT, queues_1.WORKFLOW_QUEUES.PATIENTS, queues_1.WORKFLOW_QUEUES.DASHBOARD);
        }
        else {
            (0, notifyQueueUpdated_1.notifyQueueUpdated)(queues_1.WORKFLOW_QUEUES.SLIT_LAMP, queues_1.WORKFLOW_QUEUES.PATIENTS, queues_1.WORKFLOW_QUEUES.DASHBOARD);
        }
        return checkup.rows[0];
    }
    catch (error) {
        await client.query("ROLLBACK");
        throw error;
    }
    finally {
        client.release();
    }
};
exports.default = saveSlitLampCheckup;
