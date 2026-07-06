"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findPatientCheckup = void 0;
const findPatientCheckup = async (client, patientId, checkupId) => {
    const result = await client.query(`
    SELECT id, status FROM patient_checkups
    WHERE patient_id = $1
      AND checkup_id = $2
    ORDER BY id DESC
    LIMIT 1
    `, [patientId, checkupId]);
    return result.rows[0] ?? null;
};
exports.findPatientCheckup = findPatientCheckup;
