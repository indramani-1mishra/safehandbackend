const express = require("express");
const router = express.Router();
const equipmentCategoryController = require("../controllers/equipmentCategoryController");
const { authMiddleware, isAdmin } = require("../middleware/authmiddleware");

// Admin routes
router.post("/create", authMiddleware, isAdmin, equipmentCategoryController.uploadImages, equipmentCategoryController.createEquipmentCategoryController);
router.patch("/update/:id", authMiddleware, isAdmin, equipmentCategoryController.uploadImages, equipmentCategoryController.updateEquipmentCategoryController);
router.delete("/delete/:id", authMiddleware, isAdmin, equipmentCategoryController.deleteEquipmentCategoryController);

// Public routes
router.get("/getall", equipmentCategoryController.getAllEquipmentCategoriesController);

module.exports = router;
