const express = require("express");
const router = express.Router();
const clientController = require("../controllers/clientController");
const upload = require("../middleware/multer");
const { clientAuthMiddleware, isAdmin, authMiddleware } = require("../middleware/authmiddleware");

// --- UNIVERSAL AUTH FLOW (Login & Register) ---

// 1. Send OTP (Creates account if doesn't exist)
router.post("/send-otp", clientController.sendOtpController);

// 2. Verify OTP (Returns tokens & sets cookies)
router.post("/verify-otp", clientController.verifyOtpController);

// 3. Complete Profile (Authenticated - for new users)
router.post(
    "/complete-profile",
    clientAuthMiddleware,
    upload.single("image"),
    clientController.completeRegistrationController
);


// --- SESSION MANAGEMENT ---

const resendOtpController = clientController.resendOtpController;
router.post("/resend-otp", clientController.resendOtpController);
router.post("/refresh-token", clientController.refreshTokenController);
router.post("/logout", clientController.logoutController);


// --- ADMIN / CRUD ---

router.get("/search-by-phone", authMiddleware, isAdmin, clientController.getClientByPhoneController);
router.put("/update/:id", clientAuthMiddleware, upload.single("image"), clientController.updateClientController);
router.get("/getall", clientAuthMiddleware, clientController.getAllClientsController);
router.get("/get/:id", clientAuthMiddleware, clientController.getClientByIdController);
router.delete("/delete/:id", clientAuthMiddleware, clientController.deleteClientController);

// --- USER DATA FETCHING ---
router.get("/my-jobcards", clientAuthMiddleware, clientController.getMyJobCardsController);

module.exports = router;
