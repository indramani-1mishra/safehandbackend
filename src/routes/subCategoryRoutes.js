const express = require("express");
const router = express.Router();
const subCategoryController = require("../controllers/serviceSubCategoryController");
const { authMiddleware, isAdmin } = require("../middleware/authmiddleware");
const upload = require("../middleware/multer");

router.post("/create", authMiddleware, isAdmin, upload.single("image"), subCategoryController.createServiceSubCategoryController);
router.get("/getall", subCategoryController.getAllServiceSubCategoriesController);
router.get("/getbycategory/:categoryId", subCategoryController.getServiceSubCategoryByCategoryIdController);
router.get("/get/:id", subCategoryController.getServiceSubCategoryByIdController);
router.put("/update/:id", authMiddleware, isAdmin, upload.single("image"), subCategoryController.updateServiceSubCategoryController);
router.delete("/delete/:id", authMiddleware, isAdmin, subCategoryController.deleteServiceSubCategoryController);

module.exports = router;
