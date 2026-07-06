import { CHECKUP_STATUS, CHECKUPS } from "../../../common/constants";
import { createPatientCheckup } from "../../../common/patientCheckUp";
import { findOrCreateLocation } from "../../../common/findOrCreateLocation";
import { pool } from "../../../db";
import { notifyQueueUpdated } from "../../../socket/notifyQueueUpdated";
import { WORKFLOW_QUEUES } from "../../../socket/queues";

const createPatient = async (payload: any) => {

    const {
        token_number,
        name,
        age,
        gender,
        mobile,
        location_id,
        new_location,
        remarks
    } = payload;

    if (!token_number) {
        throw new Error("Token Number is required");
    }

    if (!name) {
        throw new Error("Patient Name is required");
    }

    const existing = await pool.query(
        `SELECT id FROM patients WHERE token_number = $1`,
        [token_number]
    );

    if (existing.rows.length) {
        throw new Error("Token already exists");
    }

    const resolvedLocationId = new_location
        ? await findOrCreateLocation(new_location)
        : location_id;

const patient = await pool.query(
    `
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
    `,
    [
        token_number,
        name,
        age,
        gender,
        mobile,
        resolvedLocationId,
        remarks,
        "ACTIVE"
    ]
);

    const patientId = patient.rows[0].id;

 await createPatientCheckup({
    patientId,
    checkupId: CHECKUPS.REGISTRATION,
    status: CHECKUP_STATUS.COMPLETED
});


await createPatientCheckup({
    patientId,
    checkupId: CHECKUPS.SPECTACLE_CORRECTION,
    status: CHECKUP_STATUS.WAITING
});

notifyQueueUpdated(
    WORKFLOW_QUEUES.PATIENTS,
    WORKFLOW_QUEUES.SPECTACLE_CORRECTION,
    WORKFLOW_QUEUES.DASHBOARD
);

return patient.rows[0];

};

export default createPatient;