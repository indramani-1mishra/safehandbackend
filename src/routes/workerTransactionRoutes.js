const express = require("express");
const router = express.Router();
const workerTransactionController = require("../controllers/workerTransactionController");
const { authMiddleware, isAdmin, allowAnyAuth } = require("../middleware/authmiddleware");

// Get all transactions (Admin only)
router.get("/getall", authMiddleware, isAdmin, workerTransactionController.getAllTransactionsController);

// Get transaction by ID (Allow any authenticated admin or worker)
router.get("/get/:id", allowAnyAuth, workerTransactionController.getTransactionByIdController);

// Get all transactions for a specific worker
router.get("/worker/:workerId", allowAnyAuth, workerTransactionController.getTransactionsByWorkerIdController);

// Get all transactions for a specific job card
router.get("/jobcard/:jobCardId", allowAnyAuth, workerTransactionController.getTransactionsByJobCardIdController);

module.exports = router;
