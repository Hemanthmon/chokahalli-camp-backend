import { Router } from "express";
import { isRegistrationOpen } from "../common/registrationStatus";

const router = Router();

router.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      registrationOpen: isRegistrationOpen(),
    },
  });
});

export default router;
