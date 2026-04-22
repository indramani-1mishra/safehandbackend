const express = require("express");
const router = express.Router();
const serviceController = require("../controllers/serviceController");
const { authMiddleware, isAdmin } = require("../middleware/authmiddleware");

// CRUD Operations
router.post("/create", authMiddleware, isAdmin, serviceController.uploadImages, serviceController.createServiceController);
router.patch("/update/:id", authMiddleware, isAdmin, serviceController.uploadImages, serviceController.updateServiceController);
router.delete("/delete/:id", authMiddleware, isAdmin, serviceController.deleteServiceController);

// Public Retrieval
router.get("/getall", serviceController.getAllServicesController);
router.get("/get/:id", serviceController.getServiceByIdController);
router.get("/getbysubcategory/:subCategoryId", serviceController.getServicesBySubCategoryController);
router.get("/getbyidandcity/:id/:city", serviceController.getServiceByidandCityController);
router.get("/getbycityandsubcategory/:city/:subCategoryId", serviceController.getServiceByCityandSubCategoryIdController);
router.get("/getallcity", serviceController.getallcitycontroller);

module.exports = router;
