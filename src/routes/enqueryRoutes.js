const express = require("express");
const router = express.Router();
const { authMiddleware, isAdmin } = require("../middleware/authmiddleware");
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
router.get("/", authMiddleware, isAdmin, getAllEnquiries);
router.get("/status/:status", authMiddleware, isAdmin, getEnquiriesByStatus);
router.get("/type/:type", authMiddleware, isAdmin, getEnquiriesByType);
router.get("/type/:type/status/:status", authMiddleware, isAdmin, getEnquiryByTypeAndStatus);
router.get("/:id", authMiddleware, isAdmin, getEnquiryById);
router.put("/:id", authMiddleware, isAdmin, updateEnquiry);
router.patch("/:id/status", authMiddleware, isAdmin, updateEnquiryStatus);
router.delete("/:id", authMiddleware, isAdmin, deleteEnquiry);

module.exports = router;
