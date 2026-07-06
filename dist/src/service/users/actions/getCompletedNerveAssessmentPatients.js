"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../../common/constants");
const patientCheckupQueries_1 = require("../../../common/patientCheckupQueries");
const getCompletedNerveAssessmentPatients = async () => {
    return (0, patientCheckupQueries_1.getCompletedPatientsByCheckup)(constants_1.CHECKUPS.NERVE_ASSESSMENT);
};
exports.default = getCompletedNerveAssessmentPatients;
