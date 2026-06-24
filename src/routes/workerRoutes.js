const express = require("express");
const router = express.Router();
const workerController = require("../controllers/workerController");
const upload = require("../middleware/multer");
const { authMiddleware, isAdmin, allowAnyAuth, workerAuthMiddleware } = require("../middleware/authmiddleware");

// Create Worker - Admin only
router.post(
    "/create",
    authMiddleware,
    isAdmin,
    upload.fields([
        { name: "image", maxCount: 1 },
        { name: "documents", maxCount: 10 },
        { name: "scanner", maxCount: 1 }
    ]),
    workerController.createWorkerController
);
router.get("/getbyphone/:phone", workerController.getWorkerByPhoneController);
router.get("/getbyemail/:email", workerController.getWorkerByEmailController);


// Update Worker - Admin only
router.put(
    "/update/:id",
    allowAnyAuth,
    upload.fields([
        { name: "image", maxCount: 1 },
        { name: "documents", maxCount: 10 },
        { name: "scanner", maxCount: 1 }
    ]),
    workerController.updateWorkerController
);

// Get All Workers - Admin only 
// (If you want staff or frontend to see this without admin login, you can remove isAdmin or authMiddleware)
router.get("/getall", authMiddleware, isAdmin, workerController.getAllWorkersController);

// Get Worker by ID - Admin only
router.get("/get/:id", allowAnyAuth, workerController.getWorkerByIdController);

// Delete Worker - Admin only
router.delete("/delete/:id", authMiddleware, isAdmin, workerController.deleteWorkerController);

router.get("/free", authMiddleware, isAdmin, workerController.getFreeWorkersController);

// Filter workers by admin who created them
router.get("/by-admin/:adminId", authMiddleware, isAdmin, workerController.getWorkersByAdminIdController);

// Filter workers by busy status: "busy" or "free"
router.get("/by-status/:status", authMiddleware, isAdmin, workerController.getWorkersByBusyStatusController);

// Filter workers by createdAt date range
router.get("/by-date", authMiddleware, isAdmin, workerController.getWorkersByDateRangeController);

// Respond to checkin call notification (Yes/No)
router.post("/respond-checkin-alert", allowAnyAuth, workerController.respondToCheckInAlertController);

// 🚪 Worker Self-Registration & Onboarding Routes
router.put(
    "/complete-registration",
    workerAuthMiddleware,
    workerController.completeWorkerSelfRegistrationController
);

// NOTE: Test submission is handled securely at POST /api/questions/submit-test
// (backend grades the answers - client never gets correct answers)

router.put(
    "/bank-details",
    workerAuthMiddleware,
    upload.fields([{ name: "scanner", maxCount: 1 }]),
    workerController.updateBankDetailsController
);

router.put(
    "/documents",
    workerAuthMiddleware,
    upload.fields([{ name: "documents", maxCount: 10 }]),
    workerController.uploadDocumentsController
);

// 👑 Admin Approval Route
router.put(
    "/admin-approve/:id",
    authMiddleware,
    isAdmin,
    workerController.adminApproveWorkerController
);

module.exports = router;
