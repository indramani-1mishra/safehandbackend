const express = require("express");
const upload = require("../middleware/multer");
const { authMiddleware, isAdmin } = require("../middleware/authmiddleware");
const {
    createSubCategoryController,
    getAllSubCategoriesController,
    getSubCategoriesByCategoryController,
    updateSubCategoryController,
    deleteSubCategoryController
} = require("../controllers/productSubCategoryController");

const router = express.Router();

// Public Routes
router.get("/all", getAllSubCategoriesController);
router.get("/by-category/:categoryId", getSubCategoriesByCategoryController);

// Admin Routes
router.post("/create", authMiddleware, isAdmin, upload.single("image"), createSubCategoryController);
router.patch("/update/:id", authMiddleware, isAdmin, upload.single("image"), updateSubCategoryController);
router.delete("/delete/:id", authMiddleware, isAdmin, deleteSubCategoryController);

module.exports = router;
