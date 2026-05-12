const productOrderService = require("../services/productOrderService");

const createDirectBuyOrderController = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const order = await productOrderService.createDirectBuyOrder(userId, req.body);
        res.status(201).json({ success: true, message: "Order placed successfully", data: order });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const getUserOrdersController = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const orders = await productOrderService.getUserOrders(userId);
        res.status(200).json({ success: true, data: orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getAllOrdersController = async (req, res) => {
    try {
        const orders = await productOrderService.getAllOrders();
        res.status(200).json({ success: true, data: orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateOrderStatusController = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!status) return res.status(400).json({ success: false, message: "status is required" });

        const order = await productOrderService.updateOrderStatus(id, status);
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });

        res.status(200).json({ success: true, message: "Order status updated", data: order });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = {
    createDirectBuyOrderController,
    getUserOrdersController,
    getAllOrdersController,
    updateOrderStatusController
};
