const express = require("express");
const router = express.Router();
const invoiceController = require("../controllers/invoiceController");

router.post("/", invoiceController.createInvoiceController);
router.get("/", invoiceController.getAllInvoicesController);
router.get("/date-range", invoiceController.getInvoiceByDateRangeController);
router.get("/search/client", invoiceController.getInvoiceByClientNameOrNumberController);
router.get("/:id", invoiceController.getInvoiceByIdController);
router.get("/number/:invoiceNumber", invoiceController.getInvoiceByInvoiceNumberController);
router.get("/jobcard/:jobCardId", invoiceController.getInvoicesByJobCardIdController);
router.get("/payment/:clientPaymentId", invoiceController.getInvoicesByClientPaymentIdController);
router.put("/:id", invoiceController.updateInvoiceController);
router.delete("/:id", invoiceController.deleteInvoiceController);

module.exports = router;
