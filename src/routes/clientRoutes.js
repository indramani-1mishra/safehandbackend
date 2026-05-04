const express = require("express");
const router = express.Router();
const clientController = require("../controllers/clientController");
const upload = require("../middleware/multer");
const { authMiddleware, isAdmin } = require("../middleware/authmiddleware");

// --- REGISTRATION FLOW ---

// 1. Send OTP for Registration (Public)
router.post(
    "/register/send-otp",
    clientController.sendOtpRegistrationController
);

// 2. Verify OTP for Registration (Public - Returns Tokens)
router.post(
    "/register/verify-otp",
    clientController.verifyOtpRegistrationController
);

// 3. Complete Registration (Authenticated - Uses Access Token)
router.post(
    "/register/complete",
    authMiddleware, // Protect this route
    upload.single("image"),
    clientController.completeRegistrationController
);


// --- LOGIN FLOW ---

// Send OTP for Login
router.post(
    "/login/send-otp",
    clientController.sendOtpController
);

// Verify OTP for Login
router.post(
    "/login/verify-otp",
    clientController.verifyOtpController
);


// --- SESSION MANAGEMENT ---

// Resend OTP
router.post(
    "/resend-otp",
    clientController.resendOtpController
);

// Refresh Token
router.post(
    "/refresh-token",
    clientController.refreshTokenController
);

// Logout
router.post(
    "/logout",
    clientController.logoutController
);


// --- ADMIN / CRUD ---

// Update Client
router.put(
    "/update/:id",
    authMiddleware,
    isAdmin,
    upload.single("image"),
    clientController.updateClientController
);

// Get All Clients
router.get(
    "/getall",
    authMiddleware,
    isAdmin,
    clientController.getAllClientsController
);

// Get Client by ID
router.get(
    "/get/:id",
    authMiddleware,
    isAdmin,
    clientController.getClientByIdController
);

// Delete Client
router.delete(
    "/delete/:id",
    authMiddleware,
    isAdmin,
    clientController.deleteClientController
);

module.exports = router;
