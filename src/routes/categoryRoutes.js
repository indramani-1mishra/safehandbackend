const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/serviceCategoryController");
const { authMiddleware, isAdmin } = require("../middleware/authmiddleware");
const upload = require("../middleware/multer");

router.post("/create", authMiddleware, isAdmin, upload.single("image"), categoryController.createServiceCategoryController);
router.get("/getall", categoryController.getAllServiceCategoriesController);
router.get("/get/:id", categoryController.getServiceCategoryByIdController);
router.put("/update/:id", authMiddleware, isAdmin, upload.single("image"), categoryController.updateServiceCategoryController);
router.delete("/delete/:id", authMiddleware, isAdmin, categoryController.deleteServiceCategoryController);

module.exports = router;
