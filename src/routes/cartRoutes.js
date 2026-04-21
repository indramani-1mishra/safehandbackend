const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const { clientAuthMiddleware } = require("../middleware/authmiddleware");

// All cart routes require client authentication
router.use(clientAuthMiddleware);

// Get User's Cart
router.get("/", cartController.getCartController);

// Add Item to Cart
router.post("/add", cartController.addToCartController);

// Update Cart Item Quantity
router.put("/update/:itemId", cartController.updateCartItemController);

// Remove Item from Cart
router.delete("/remove/:itemId", cartController.removeCartItemController);

// Clear Entire Cart
router.delete("/clear", cartController.clearCartController);

module.exports = router;
