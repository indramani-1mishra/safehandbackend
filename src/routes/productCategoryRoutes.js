const express = require("express");
const upload = require("../middleware/multer");
const { authMiddleware, isAdmin } = require("../middleware/authmiddleware");
const {
    createCategoryController,
    getAllCategoriesController,
    updateCategoryController,
    deleteCategoryController
} = require("../controllers/productCategoryController");

const router = express.Router();

// Public Route
router.get("/all", getAllCategoriesController);

// Admin Routes
router.post("/create", authMiddleware, isAdmin, upload.single("image"), createCategoryController);
router.patch("/update/:id", authMiddleware, isAdmin, upload.single("image"), updateCategoryController);
router.delete("/delete/:id", authMiddleware, isAdmin, deleteCategoryController);

module.exports = router;
