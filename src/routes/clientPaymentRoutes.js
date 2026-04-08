const express = require("express");
const router = express.Router();
const clientPaymentController = require("../controllers/ClientPaymentController");

// Create payment
router.post("/", clientPaymentController.createClientPayment);

// Get today's due payments (Admin Panel Alert)
router.get("/due/today", clientPaymentController.getTodayDuePayments);

// Get all payments (with pagination)
router.get("/", clientPaymentController.getAllClientPayments);

// Get payments for a specific JobCard
router.get("/jobcard/:jobCardId", clientPaymentController.getClientPaymentsByJobCardId);

// Delete payment
router.delete("/:id", clientPaymentController.deleteClientPayment);

module.exports = router;
