const express = require("express");
const router = express.Router();
const dashboardService = require("../services/dashboardService");
const { authMiddleware, isAdmin } = require("../middleware/authmiddleware");

// GET /api/dashboard/summary?filter=today
router.get("/summary", authMiddleware, isAdmin, async (req, res) => {
    try {
        const { filter } = req.query;
        const response = await dashboardService.getAdminDashboardSummary(filter);
        res.status(200).json({
            success: true,
            data: response,
            message: `Dashboard summary (${filter || 'all'}) fetched successfully`
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
