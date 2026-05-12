const express = require("express");
const { clientAuthMiddleware, authMiddleware, isAdmin } = require("../middleware/authmiddleware");
const {
    createDirectBuyOrderController,
    getUserOrdersController,
    getAllOrdersController,
    updateOrderStatusController
} = require("../controllers/productOrderController");

const router = express.Router();

// User Routes
router.post("/direct-buy", clientAuthMiddleware, createDirectBuyOrderController);
router.get("/my-orders", clientAuthMiddleware, getUserOrdersController);

// Admin Routes
router.get("/all", authMiddleware, isAdmin, getAllOrdersController);
router.patch("/status/:id", authMiddleware, isAdmin, updateOrderStatusController);

module.exports = router;
