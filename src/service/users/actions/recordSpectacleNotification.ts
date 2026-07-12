import { CHECKUPS, NOTIFICATION_TYPE } from "../../../common/constants";
import { findPatientCheckup } from "../../../common/findPatientCheckup";
import { pool } from "../../../db";

interface RecordSpectacleNotificationPayload {
  patient_id: number;
  channel: string;
}

// Records that a WhatsApp/SMS deep link was opened for this patient — never
// that the message was actually sent, since there is no gateway or API
// involved and the volunteer must manually press Send inside their own
// messaging app. This is "last attempt only" by design (no history table)
// per the current, deliberately minimal notification-tracking requirement.
const recordSpectacleNotification = async (
  payload: RecordSpectacleNotificationPayload
) => {
  const { patient_id, channel } = payload;

  if (!patient_id) {
    throw new Error("Patient is required");
  }

  if (!Object.values(NOTIFICATION_TYPE).includes(channel as any)) {
    throw new Error("Invalid notification channel");
  }

  const checkup = await findPatientCheckup(
    pool,
    patient_id,
    CHECKUPS.SPECTACLE_CORRECTION
  );

  if (!checkup) {
    throw new Error("No spectacle correction checkup found for this patient");
  }

  const result = await pool.query(
    `
    UPDATE spectacle_corrections
    SET last_notification_type = $1, last_notification_at = now()
    WHERE patient_checkup_id = $2
    RETURNING *
    `,
    [channel, checkup.id]
  );

  if (!result.rows.length) {
    throw new Error("No spectacle correction record found for this patient");
  }

  return result.rows[0];
};

export default recordSpectacleNotification;
