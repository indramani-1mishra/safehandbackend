const express = require("express");
const router = express.Router();
const workerController = require("../controllers/workerController");
const upload = require("../middleware/multer");
const { authMiddleware, isAdmin } = require("../middleware/authmiddleware");

// Create Worker - Admin only
router.post(
    "/create",
    authMiddleware,
    isAdmin,
    upload.fields([
        { name: "image", maxCount: 1 },
        { name: "documents", maxCount: 10 }
    ]),
    workerController.createWorkerController
);
router.get("/getbyphone/:phone", workerController.getWorkerByPhoneController);
router.get("/getbyemail/:email", workerController.getWorkerByEmailController);


// Update Worker - Admin only
router.put(
    "/update/:id",


    upload.fields([
        { name: "image", maxCount: 1 },
        { name: "documents", maxCount: 10 }
    ]),
    workerController.updateWorkerController
);

// Get All Workers - Admin only 
// (If you want staff or frontend to see this without admin login, you can remove isAdmin or authMiddleware)
router.get("/getall", authMiddleware, isAdmin, workerController.getAllWorkersController);

// Get Worker by ID - Admin only
router.get("/get/:id", workerController.getWorkerByIdController);

// Delete Worker - Admin only
router.delete("/delete/:id", authMiddleware, isAdmin, workerController.deleteWorkerController);

router.get("/free", authMiddleware, isAdmin, workerController.getFreeWorkersController);
module.exports = router;
