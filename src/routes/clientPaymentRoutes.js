const express = require("express");
const router = express.Router();
const clientPaymentController = require("../controllers/ClientPaymentController");
const upload = require("../middleware/multer");
// Create payment
router.post("/", upload.single("proofUrl"), clientPaymentController.createClientPayment);

// Get today's due payments (Admin Panel Alert)
router.get("/due/today", clientPaymentController.getTodayDuePayments);

// Get all payments (with pagination)
router.get("/", clientPaymentController.getAllClientPayments);

// Get payments for a specific JobCard
router.get("/jobcard/:jobCardId", clientPaymentController.getClientPaymentsByJobCardId);

// Delete payment
router.delete("/:id", clientPaymentController.deleteClientPayment);

module.exports = router;
