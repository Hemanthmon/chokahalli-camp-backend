"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPatientCheckup = void 0;
const db_1 = require("../db");
const createPatientCheckup = async ({ patientId, checkupId, status }, client = db_1.pool) => {
    await client.query(`
    INSERT INTO patient_checkups
    (
      patient_id,
      checkup_id,
      status
    )
    VALUES
    (
      $1,
      $2,
      $3
    )
    `, [patientId, checkupId, status]);
};
exports.createPatientCheckup = createPatientCheckup;
