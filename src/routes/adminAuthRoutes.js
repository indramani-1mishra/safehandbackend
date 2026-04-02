const express = require("express");
const router = express.Router();
const { AdminLogin, AdminLogout, AdminRefreshToken } = require("../controllers/AdminAuth");

router.post("/login", AdminLogin);
router.post("/refresh", AdminRefreshToken);
router.post("/logout", AdminLogout);

module.exports = router;
