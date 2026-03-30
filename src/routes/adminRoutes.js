const express = require("express");
const router = express.Router();
const adminController = require("../controllers/createAdminController");

router.post("/create", adminController.createAdminController);
router.put("/update/:id", adminController.updateAdminController);
router.get("/getall", adminController.getAllAdminsController);
router.delete("/delete/:id", adminController.deleteAdminController);
router.get("/get/:id", adminController.getAdminByIdController);
router.post("/makeadmin/:id", adminController.makeAdminController);

module.exports = router;
