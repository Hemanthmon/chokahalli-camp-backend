// Defaults to open — set REGISTRATION_OPEN=false in the environment to stop
// new patient registrations once a camp has ended. Flip it back to enable
// registration for the next camp; no code changes needed either way.
export const isRegistrationOpen = (): boolean =>
  process.env.REGISTRATION_OPEN !== "false";
