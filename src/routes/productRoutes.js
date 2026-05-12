const express = require("express");
const upload = require("../middleware/multer");
const { authMiddleware, isAdmin } = require("../middleware/authmiddleware");
const {
    createProductController,
    getAllProductsController,
    getProductsBySubCategoryController,
    getProductByIdController,
    updateProductController,
    deleteProductController
} = require("../controllers/productController");

const router = express.Router();

// Public Routes
router.get("/all", getAllProductsController);
router.get("/by-subcategory/:subCategoryId", getProductsBySubCategoryController);
router.get("/:id", getProductByIdController);

// Admin Routes
router.post("/create", authMiddleware, isAdmin, upload.single("image"), createProductController);
router.patch("/update/:id", authMiddleware, isAdmin, upload.single("image"), updateProductController);
router.delete("/delete/:id", authMiddleware, isAdmin, deleteProductController);

module.exports = router;
