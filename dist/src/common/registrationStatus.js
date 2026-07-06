"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRegistrationOpen = void 0;
// Defaults to open — set REGISTRATION_OPEN=false in the environment to stop
// new patient registrations once a camp has ended. Flip it back to enable
// registration for the next camp; no code changes needed either way.
const isRegistrationOpen = () => process.env.REGISTRATION_OPEN !== "false";
exports.isRegistrationOpen = isRegistrationOpen;
