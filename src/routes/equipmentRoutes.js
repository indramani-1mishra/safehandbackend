const express = require("express");
const router = express.Router();
const equipmentController = require("../controllers/equipmentController");
const { authMiddleware, isAdmin } = require("../middleware/authmiddleware");

// Admin Routes
router.post("/create", authMiddleware, isAdmin, equipmentController.uploadImages, equipmentController.createEquipmentController);
router.patch("/update/:id", authMiddleware, isAdmin, equipmentController.uploadImages, equipmentController.updateEquipmentController);
router.delete("/delete/:id", authMiddleware, isAdmin, equipmentController.deleteEquipmentController);

// Public Routes
router.get("/getall", equipmentController.getAllEquipmentsController);
router.get("/get/:id", equipmentController.getEquipmentByIdController);
router.get("/getbycategory/:categoryId", equipmentController.getEquipmentsByCategoryController);

module.exports = router;
