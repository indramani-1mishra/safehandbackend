const express = require("express");
const router = express.Router();
const adminController = require("../controllers/createAdminController");
const { authMiddleware, isAdmin } = require("../middleware/authmiddleware");

router.post("/create", authMiddleware, isAdmin, adminController.createAdminController);
router.put("/update/:id", authMiddleware, isAdmin, adminController.updateAdminController);
router.get("/getall", authMiddleware, isAdmin, adminController.getAllAdminsController);
router.delete("/delete/:id", authMiddleware, isAdmin, adminController.deleteAdminController);
router.get("/get/:id", authMiddleware, isAdmin, adminController.getAdminByIdController);
router.post("/makeadmin/:id", authMiddleware, isAdmin, adminController.makeAdminController);

module.exports = router;
