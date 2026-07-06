import { CHECKUPS } from "../common/constants";

export const WORKFLOW_QUEUES = {
  PATIENTS: "patients",
  SPECTACLE_CORRECTION: "spectacle-correction",
  SLIT_LAMP: "slit-lamp",
  NERVE_ASSESSMENT: "nerve-assessment",
  FINAL_ASSESSMENT: "final-assessment",
  DASHBOARD: "dashboard",
} as const;

export type WorkflowQueue =
  (typeof WORKFLOW_QUEUES)[keyof typeof WORKFLOW_QUEUES];

export const ALL_WORKFLOW_QUEUES = Object.values(WORKFLOW_QUEUES);

// Maps a numeric checkup id to the Socket.IO room that represents its queue.
// Used by the generic /workflow/start endpoint, which only knows a checkup id.
export const CHECKUP_QUEUE_MAP: Record<number, WorkflowQueue> = {
  [CHECKUPS.SPECTACLE_CORRECTION]: WORKFLOW_QUEUES.SPECTACLE_CORRECTION,
  [CHECKUPS.SLIT_LAMP_CHECKUP]: WORKFLOW_QUEUES.SLIT_LAMP,
  [CHECKUPS.NERVE_ASSESSMENT]: WORKFLOW_QUEUES.NERVE_ASSESSMENT,
  [CHECKUPS.BP_SUGAR_TEST]: WORKFLOW_QUEUES.FINAL_ASSESSMENT,
  [CHECKUPS.OPERATION_RECOMMENDATION]: WORKFLOW_QUEUES.FINAL_ASSESSMENT,
};
