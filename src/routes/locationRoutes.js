const express = require("express");
const router = express.Router();
const { requestLocation, reportLocation, getLatestLocation } = require("../controllers/locationController");
const { authMiddleware, isAdmin } = require("../middleware/authmiddleware");

// Admin requests a location from worker or client
router.post("/request", authMiddleware, isAdmin, requestLocation);

// Admin gets the latest saved location for a worker or client
router.get("/latest", authMiddleware, isAdmin, getLatestLocation);

// Mobile app reports back location coordinates
router.post("/report", reportLocation);

module.exports = router;
