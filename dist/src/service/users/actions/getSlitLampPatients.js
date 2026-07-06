"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../../common/constants");
const patientCheckupQueries_1 = require("../../../common/patientCheckupQueries");
const getSlitLampPatients = async () => {
    return (0, patientCheckupQueries_1.getWaitingPatientsByCheckup)(constants_1.CHECKUPS.SLIT_LAMP_CHECKUP);
};
exports.default = getSlitLampPatients;
