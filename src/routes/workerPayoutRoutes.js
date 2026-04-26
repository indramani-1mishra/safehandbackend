const express = require("express");
const router = express.Router();
const workerPayoutController = require("../controllers/WorkerPayoutController");
const { authMiddleware, isAdmin, workerAuthMiddleware, allowAnyAuth } = require("../middleware/authmiddleware");

/**
 * @section Worker Endpoints
 */

// 1. Worker: Request to pay (Worker only)
router.post("/request", workerAuthMiddleware, workerPayoutController.requestPayoutController);

// 2. Worker: Get balance breakdown (Worker or Admin)
router.get("/balance", allowAnyAuth, workerPayoutController.getWorkerBalanceController);

// 3. Worker: Get payment history (Worker or Admin)
router.get("/history/:workerId", allowAnyAuth, workerPayoutController.getWorkerHistory);


/**
 * @section Admin Endpoints
 */

// 4. Admin: Get all pending requests
router.get("/pending", authMiddleware, isAdmin, workerPayoutController.getPendingPayoutRequestsController);

// 5. Admin: Get summary of all worker payables (Bulk overview)
router.get("/admin/summary", authMiddleware, isAdmin, workerPayoutController.getAdminAllWorkersPayablesController);

// 6. Admin: Get all paid/approved payouts (History)
router.get("/paid", authMiddleware, isAdmin, workerPayoutController.getPaidPayoutsController);

// 7. Admin: Approve a pending request
router.put("/approve/:id", authMiddleware, isAdmin, workerPayoutController.approvePayoutRequestController);

// 8. Admin: Mark as paid manually (Create Payout)
router.post("/", authMiddleware, isAdmin, workerPayoutController.createWorkerPayout);

// 9. Admin/Worker: Get due balance (Legacy endpoint)
router.get("/due", allowAnyAuth, workerPayoutController.getWorkerPayoutDue);

module.exports = router;
