"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../../common/constants");
const patientCheckupQueries_1 = require("../../../common/patientCheckupQueries");
const getNerveAssessmentPatients = async () => {
    return (0, patientCheckupQueries_1.getWaitingPatientsByCheckup)(constants_1.CHECKUPS.NERVE_ASSESSMENT);
};
exports.default = getNerveAssessmentPatients;
