const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const adminController = require("../controllers/createAdminController");
const { authMiddleware, isAdmin } = require("../middleware/authmiddleware");

router.post("/create", authMiddleware, isAdmin, upload.single('image'), adminController.createAdminController);
router.put("/update/:id", authMiddleware, isAdmin, upload.single('image'), adminController.updateAdminController);
router.get("/getall", authMiddleware, isAdmin, adminController.getAllAdminsController);
router.delete("/delete/:id", authMiddleware, isAdmin, adminController.deleteAdminController);
router.get("/get/:id", authMiddleware, isAdmin, adminController.getAdminByIdController);
router.post("/makeadmin/:id", authMiddleware, isAdmin, adminController.makeAdminController);
router.put("/approve/:id", authMiddleware, isAdmin, adminController.approveAdminController);
router.put("/deactivate/:id", authMiddleware, isAdmin, adminController.deactivateAdminController);

module.exports = router;
