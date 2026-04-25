const express = require("express");
const router = express.Router();
const workerPayoutController = require("../controllers/WorkerPayoutController");

// 1. Worker: Request to pay
router.post("/request", workerPayoutController.requestPayoutController);

// 2. Worker: Get balance breakdown
router.get("/balance", workerPayoutController.getWorkerBalanceController);

// 3. Admin: Get all pending requests
router.get("/pending", workerPayoutController.getPendingPayoutRequestsController);

// 4. Admin: Get summary of all worker payables
router.get("/admin/summary", workerPayoutController.getAdminAllWorkersPayablesController);

// 5. Admin: Get all paid/approved payouts
router.get("/paid", workerPayoutController.getPaidPayoutsController);

// 6. Admin: Approve a pending request
router.put("/approve/:id", workerPayoutController.approvePayoutRequestController);

// 7. Admin: Mark as paid manually (Create Payout)
router.post("/", workerPayoutController.createWorkerPayout);

// 4. Get workers due balance (Based on Attendance)
router.get("/due", workerPayoutController.getWorkerPayoutDue);

// 5. Get worker's payment history
router.get("/history/:workerId", workerPayoutController.getWorkerHistory);

module.exports = router;
