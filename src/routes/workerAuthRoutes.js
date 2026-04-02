const express = require("express");
const { SendOtpController, VerifyOtpController, ResendOtpController, LogoutController, RefreshTokenController } = require("../controllers/workerAuth");
const router = express.Router();

router.post("/send-otp", SendOtpController);
router.post("/verify-otp", VerifyOtpController);
router.post("/resend-otp", ResendOtpController);
router.post("/logout", LogoutController);
router.post("/refresh-token", RefreshTokenController);

module.exports = router;