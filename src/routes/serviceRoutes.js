const express = require("express");
const router = express.Router();
const serviceController = require("../controllers/serviceController");

// Route to create a new service (handles multipart/form-data for images)
router.post(
    "/create",
    serviceController.uploadImages,
    serviceController.createServiceController
);
router.get(
    "/findservice",
    serviceController.getonlyservicenameandimagecontroller
);
// Route to update an existing service (handles multipart/form-data for new images if any)
router.patch(
    "/update/:id",
    serviceController.uploadImages,
    serviceController.updateServiceController
);

// Route to get all services
router.get(
    "/getall",
    serviceController.getAllServicesController
);

// Route to get a specific service by ID
router.get(
    "/get/:id",
    serviceController.getServiceByIdController
);

// Route to delete a service by ID
router.delete(
    "/delete/:id",
    serviceController.deleteServiceController
);

module.exports = router;
