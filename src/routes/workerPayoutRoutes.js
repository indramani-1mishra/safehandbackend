const express = require("express");
const router = express.Router();
const workerPayoutController = require("../controllers/WorkerPayoutController");

// Create worker payout
router.post("/", workerPayoutController.createWorkerPayout);

// Get workers due balance (Based on Attendance)
// Example: /api/worker-payouts/due?workerId=...&jobCardId=...
router.get("/due", workerPayoutController.getWorkerPayoutDue);

// Get worker's payment history
router.get("/history/:workerId", workerPayoutController.getWorkerHistory);

module.exports = router;
