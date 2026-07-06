"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../../common/constants");
const patientCheckUp_1 = require("../../../common/patientCheckUp");
const findPatientCheckup_1 = require("../../../common/findPatientCheckup");
const db_1 = require("../../../db");
const notifyQueueUpdated_1 = require("../../../socket/notifyQueueUpdated");
const queues_1 = require("../../../socket/queues");
const saveSpectacleCorrection = async (payload) => {
    const { patient_id, left_eye, right_eye, spectacle_required, spectacle_status, remarks, } = payload;
    if (!patient_id) {
        throw new Error("Patient is required");
    }
    const client = await db_1.pool.connect();
    try {
        await client.query("BEGIN");
        const checkup = await (0, findPatientCheckup_1.findPatientCheckup)(client, patient_id, constants_1.CHECKUPS.SPECTACLE_CORRECTION);
        if (!checkup) {
            throw new Error("No spectacle correction checkup found for this patient");
        }
        if (checkup.status === constants_1.CHECKUP_STATUS.SKIPPED) {
            throw new Error("This stage was skipped for this patient");
        }
        const patientCheckupId = checkup.id;
        const existing = await client.query(`SELECT id FROM spectacle_corrections WHERE patient_checkup_id = $1`, [patientCheckupId]);
        const isFirstSave = !existing.rows.length;
        const correction = isFirstSave
            ? await client.query(`
          INSERT INTO spectacle_corrections
          (
              patient_checkup_id,
              left_eye,
              right_eye,
              spectacle_required,
              spectacle_status,
              remarks
          )
          VALUES
          (
              $1, $2, $3, $4, $5, $6
          )
          RETURNING *
          `, [
                patientCheckupId,
                left_eye,
                right_eye,
                spectacle_required ?? false,
                spectacle_status,
                remarks,
            ])
            : await client.query(`
          UPDATE spectacle_corrections
          SET
              left_eye = $1,
              right_eye = $2,
              spectacle_required = $3,
              spectacle_status = $4,
              remarks = $5,
              updated_at = now()
          WHERE patient_checkup_id = $6
          RETURNING *
          `, [
                left_eye,
                right_eye,
                spectacle_required ?? false,
                spectacle_status,
                remarks,
                patientCheckupId,
            ]);
        if (isFirstSave) {
            await client.query(`
        UPDATE patient_checkups
        SET status = $1, completed_at = now()
        WHERE id = $2
        `, [constants_1.CHECKUP_STATUS.COMPLETED, patientCheckupId]);
            await (0, patientCheckUp_1.createPatientCheckup)({
                patientId: patient_id,
                checkupId: constants_1.CHECKUPS.SLIT_LAMP_CHECKUP,
                status: constants_1.CHECKUP_STATUS.WAITING,
            }, client);
        }
        await client.query("COMMIT");
        (0, notifyQueueUpdated_1.notifyQueueUpdated)(queues_1.WORKFLOW_QUEUES.SPECTACLE_CORRECTION, queues_1.WORKFLOW_QUEUES.SLIT_LAMP, queues_1.WORKFLOW_QUEUES.PATIENTS, queues_1.WORKFLOW_QUEUES.DASHBOARD);
        return correction.rows[0];
    }
    catch (error) {
        await client.query("ROLLBACK");
        throw error;
    }
    finally {
        client.release();
    }
};
exports.default = saveSpectacleCorrection;
