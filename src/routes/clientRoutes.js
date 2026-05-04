const express = require("express");
const router = express.Router();
const clientController = require("../controllers/clientController");
const upload = require("../middleware/multer");
const { authMiddleware, isAdmin } = require("../middleware/authmiddleware");

// --- UNIVERSAL AUTH FLOW (Login & Register) ---

// 1. Send OTP (Creates account if doesn't exist)
router.post("/send-otp", clientController.sendOtpController);

// 2. Verify OTP (Returns tokens & sets cookies)
router.post("/verify-otp", clientController.verifyOtpController);

// 3. Complete Profile (Authenticated - for new users)
router.post(
    "/complete-profile",
    authMiddleware,
    upload.single("image"),
    clientController.completeRegistrationController
);


// --- SESSION MANAGEMENT ---

router.post("/resend-otp", clientController.resendOtpController);
router.post("/refresh-token", clientController.refreshTokenController);
router.post("/logout", clientController.logoutController);


// --- ADMIN / CRUD ---

router.put("/update/:id", authMiddleware, isAdmin, upload.single("image"), clientController.updateClientController);
router.get("/getall", authMiddleware, isAdmin, clientController.getAllClientsController);
router.get("/get/:id", authMiddleware, isAdmin, clientController.getClientByIdController);
router.delete("/delete/:id", authMiddleware, isAdmin, clientController.deleteClientController);

module.exports = router;
