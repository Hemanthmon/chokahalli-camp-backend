export const CHECKUPS = {
  REGISTRATION: 1,
  SPECTACLE_CORRECTION: 2,
  SLIT_LAMP_CHECKUP: 3,
  NERVE_ASSESSMENT: 4,
  BP_SUGAR_TEST: 5,
  OPERATION_RECOMMENDATION: 6,
} as const;

export const CHECKUP_STATUS = {
  WAITING: "WAITING",
  ONGOING: "ONGOING",
  COMPLETED: "COMPLETED",
  PENDING: "PENDING",
  SKIPPED: "SKIPPED",
} as const;

// Canonical spectacle_status vocabulary, used by every flow that reads or
// writes spectacle_corrections: the volunteer intake form, the admin
// distribution action, the doctor panel, and the public status portal.
export const SPECTACLE_STATUS = {
  NOT_REQUIRED: "NOT_REQUIRED",
  RECOMMENDED: "RECOMMENDED",
  RECEIVED: "RECEIVED",
  COLLECTED: "COLLECTED",
} as const;

// Channel used for the last spectacle-distribution notification attempt —
// deep links only (WhatsApp/SMS apps opened with a prefilled message), no
// gateway or Business API, so this is only ever set when a volunteer taps
// "initiate" and never implies the message was actually sent.
export const NOTIFICATION_TYPE = {
  WHATSAPP: "WHATSAPP",
  SMS: "SMS",
} as const;

export const ROLES = {
  ADMIN: "ADMIN",
  RECEPTION: "RECEPTION",
  VOLUNTEER: "VOLUNTEER",
  DOCTOR: "DOCTOR",
} as const;

export const ROOM_CHECKUPS: Record<string, number> = {
  "spectacle-correction": CHECKUPS.SPECTACLE_CORRECTION,
  "slit-lamp": CHECKUPS.SLIT_LAMP_CHECKUP,
  nerve: CHECKUPS.NERVE_ASSESSMENT,
  "bp-sugar": CHECKUPS.BP_SUGAR_TEST,
  operation: CHECKUPS.OPERATION_RECOMMENDATION,
};