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

// Equipment cart routes
router.post("/add-equipment", cartController.addEquipmentToCartController);
router.put("/update-equipment/:itemId", cartController.updateEquipmentCartItemController);
router.delete("/remove-equipment/:itemId", cartController.removeEquipmentCartItemController);

// Product cart routes
router.post("/add-product", cartController.addProductToCartController);
router.put("/update-product/:itemId", cartController.updateProductCartItemController);
router.delete("/remove-product/:itemId", cartController.removeProductCartItemController);

module.exports = router;
