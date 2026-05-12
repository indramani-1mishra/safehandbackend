const express = require("express");
const { processCheckoutController } = require("../controllers/checkoutController");
const { clientAuthMiddleware } = require("../middleware/authmiddleware");

const router = express.Router();

// Route: POST /api/checkout/process
// Description: Processes the entire mixed cart (Services + Equipments)
// Access: Client/User
router.post("/process", clientAuthMiddleware, processCheckoutController);

module.exports = router;
