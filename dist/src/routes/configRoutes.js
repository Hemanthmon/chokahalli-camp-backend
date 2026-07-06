"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const registrationStatus_1 = require("../common/registrationStatus");
const router = (0, express_1.Router)();
router.get("/", (_req, res) => {
    res.status(200).json({
        success: true,
        data: {
            registrationOpen: (0, registrationStatus_1.isRegistrationOpen)(),
        },
    });
});
exports.default = router;
