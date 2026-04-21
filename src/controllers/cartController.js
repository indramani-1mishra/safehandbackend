const cartService = require("../services/cartService");

const getCartController = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const cart = await cartService.getCartByUserIdService(userId);
        res.status(200).json({
            success: true,
            data: cart
        });
    } catch (error) {
        res.status(error.message === "Cart not found" ? 404 : 500).json({
            success: false,
            message: error.message
        });
    }
};

const addToCartController = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        console.log(req.user);
        const { serviceId, selectionDetails, quantity, city } = req.body;

        // Use selectionDetails if provided, otherwise fallback to city in root body
        const finalSelection = selectionDetails || { city };

        const cart = await cartService.addToCartService(userId, serviceId, finalSelection, quantity);
        res.status(200).json({
            success: true,
            message: "Item added to cart",
            data: cart
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const updateCartItemController = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const { itemId } = req.params;
        const { quantity } = req.body;

        const cart = await cartService.updateCartItemService(userId, itemId, quantity);
        res.status(200).json({
            success: true,
            message: "Cart updated",
            data: cart
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const removeCartItemController = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const { itemId } = req.params;

        const cart = await cartService.removeCartItemService(userId, itemId);
        res.status(200).json({
            success: true,
            message: "Item removed from cart",
            data: cart
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const clearCartController = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const cart = await cartService.clearCartService(userId);
        res.status(200).json({
            success: true,
            message: "Cart cleared",
            data: cart
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getCartController,
    addToCartController,
    updateCartItemController,
    removeCartItemController,
    clearCartController
};
