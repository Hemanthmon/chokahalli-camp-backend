import { Router } from "express";
import { isRegistrationOpen } from "../common/registrationStatus";

const router = Router();

router.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      registrationOpen: isRegistrationOpen(),
      // Never hardcode a phone number in source — this is the one place
      // it's configured, so it can change without a code deploy. null
      // when unset, so callers can hide the contact option gracefully
      // rather than render a broken/empty number.
      campSupportPhone: process.env.CAMP_SUPPORT_PHONE || null,
    },
  });
});

export default router;
