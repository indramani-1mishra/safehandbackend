const express = require("express");
const router = express.Router();
const equipmentOrderController = require("../controllers/equipmentOrderController");
const { authMiddleware, isAdmin, clientAuthMiddleware } = require("../middleware/authmiddleware");

// User routes (Client Auth required)
router.post("/book", clientAuthMiddleware, equipmentOrderController.createOrderController);
router.get("/my-orders", clientAuthMiddleware, equipmentOrderController.getUserOrdersController);

// Admin routes (Admin Auth required)
router.get("/all", authMiddleware, isAdmin, equipmentOrderController.getAllOrdersController);
router.get("/get/:id", authMiddleware, isAdmin, equipmentOrderController.getOrderByIdController);
router.patch("/status/:id", authMiddleware, isAdmin, equipmentOrderController.updateOrderStatusController);

module.exports = router;
