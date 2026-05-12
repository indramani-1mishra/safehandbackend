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
        console.log(userId);
        const { serviceId, selectionDetails, quantity, city } = req.body;
        console.log(serviceId, selectionDetails, quantity, city);

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

const addEquipmentToCartController = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const { equipmentId, orderType, quantity } = req.body;

        const cart = await cartService.addEquipmentToCartService(userId, equipmentId, orderType, quantity);
        res.status(200).json({
            success: true,
            message: "Equipment added to cart",
            data: cart
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const updateEquipmentCartItemController = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const { itemId } = req.params;
        const { quantity } = req.body;

        const cart = await cartService.updateEquipmentCartItemService(userId, itemId, quantity);
        res.status(200).json({
            success: true,
            message: "Equipment cart updated",
            data: cart
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const removeEquipmentCartItemController = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const { itemId } = req.params;

        const cart = await cartService.removeEquipmentCartItemService(userId, itemId);
        res.status(200).json({
            success: true,
            message: "Equipment removed from cart",
            data: cart
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const addProductToCartController = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const { productId, quantity } = req.body;

        if (!productId) {
            return res.status(400).json({ success: false, message: "productId is required" });
        }

        const cart = await cartService.addProductToCartService(userId, productId, quantity || 1);
        res.status(200).json({ success: true, message: "Product added to cart successfully", data: cart });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

const updateProductCartItemController = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const { itemId, quantity } = req.body;

        if (!itemId || !quantity) {
            return res.status(400).json({ success: false, message: "itemId and quantity are required" });
        }

        const cart = await cartService.updateProductCartItemService(userId, itemId, quantity);
        res.status(200).json({ success: true, message: "Product quantity updated", data: cart });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

const removeProductCartItemController = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const { itemId } = req.params;

        if (!itemId) {
            return res.status(400).json({ success: false, message: "itemId is required" });
        }

        const cart = await cartService.removeProductCartItemService(userId, itemId);
        res.status(200).json({ success: true, message: "Product item removed from cart", data: cart });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

module.exports = {
    getCartController,
    addToCartController,
    updateCartItemController,
    removeCartItemController,
    clearCartController,
    addEquipmentToCartController,
    updateEquipmentCartItemController,
    removeEquipmentCartItemController,
    addProductToCartController,
    updateProductCartItemController,
    removeProductCartItemController
};
