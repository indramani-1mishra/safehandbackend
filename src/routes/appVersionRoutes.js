const express = require("express");
const router = express.Router();
const { checkAppVersion, upsertAppVersion, getAppVersionConfig } = require("../controllers/appVersionController");
const { authMiddleware, isAdmin } = require("../middleware/authmiddleware");

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC ROUTE — No auth required
// Flutter app calls this on startup BEFORE the user logs in
//
// GET /api/app/version-check?platform=android&current_version=1.0.0
// ─────────────────────────────────────────────────────────────────────────────
router.get("/version-check", checkAppVersion);

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN PROTECTED ROUTES — Requires admin cookie token
//
// POST /api/app/admin/version       → Create or update version config
// GET  /api/app/admin/version       → View all platform version configs
// ─────────────────────────────────────────────────────────────────────────────
router.post("/admin/version", authMiddleware, isAdmin, upsertAppVersion);
router.get("/admin/version", authMiddleware, isAdmin, getAppVersionConfig);

module.exports = router;
