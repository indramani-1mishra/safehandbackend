const express = require("express");
const router = express.Router();
const {
    createEnquiry,
    updateEnquiry,
    updateEnquiryStatus,
    getAllEnquiries,
    getEnquiryById,
    deleteEnquiry,
    getEnquiriesByStatus,
    getEnquiriesByType,
    getEnquiryByTypeAndStatus
} = require("../controllers/enqueryController");

router.post("/", createEnquiry);
router.get("/", getAllEnquiries);
router.get("/:id", getEnquiryById);
router.put("/:id", updateEnquiry);
router.patch("/:id/status", updateEnquiryStatus);
router.delete("/:id", deleteEnquiry);
router.get("/status/:status", getEnquiriesByStatus);
router.get("/type/:type", getEnquiriesByType);
router.get("/type/:type/status/:status", getEnquiryByTypeAndStatus);

module.exports = router;
