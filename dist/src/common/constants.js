"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROOM_CHECKUPS = exports.ROLES = exports.CHECKUP_STATUS = exports.CHECKUPS = void 0;
exports.CHECKUPS = {
    REGISTRATION: 1,
    SPECTACLE_CORRECTION: 2,
    SLIT_LAMP_CHECKUP: 3,
    NERVE_ASSESSMENT: 4,
    BP_SUGAR_TEST: 5,
    OPERATION_RECOMMENDATION: 6,
};
exports.CHECKUP_STATUS = {
    WAITING: "WAITING",
    ONGOING: "ONGOING",
    COMPLETED: "COMPLETED",
    PENDING: "PENDING",
    SKIPPED: "SKIPPED",
};
exports.ROLES = {
    ADMIN: "ADMIN",
    RECEPTION: "RECEPTION",
    VOLUNTEER: "VOLUNTEER",
    DOCTOR: "DOCTOR",
};
exports.ROOM_CHECKUPS = {
    "spectacle-correction": exports.CHECKUPS.SPECTACLE_CORRECTION,
    "slit-lamp": exports.CHECKUPS.SLIT_LAMP_CHECKUP,
    nerve: exports.CHECKUPS.NERVE_ASSESSMENT,
    "bp-sugar": exports.CHECKUPS.BP_SUGAR_TEST,
    operation: exports.CHECKUPS.OPERATION_RECOMMENDATION,
};
