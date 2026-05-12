const equipmentOrderService = require("../services/equipmentOrderService");

const createOrderController = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const orderData = { ...req.body, userId };

        const newOrder = await equipmentOrderService.createOrderService(orderData);
        return res.status(201).json({
            success: true,
            message: "Equipment order placed successfully",
            data: newOrder
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const getUserOrdersController = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const orders = await equipmentOrderService.getUserOrdersService(userId);
        return res.status(200).json({
            success: true,
            data: orders
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const getAllOrdersController = async (req, res) => {
    try {
        const orders = await equipmentOrderService.getAllOrdersService(req.query);
        return res.status(200).json({
            success: true,
            data: orders
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const getOrderByIdController = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await equipmentOrderService.getOrderByIdService(id);
        return res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        return res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

const updateOrderStatusController = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            throw new Error("Status is required");
        }

        const updatedOrder = await equipmentOrderService.updateOrderStatusService(id, status);
        return res.status(200).json({
            success: true,
            message: "Order status updated successfully",
            data: updatedOrder
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createOrderController,
    getUserOrdersController,
    getAllOrdersController,
    getOrderByIdController,
    updateOrderStatusController
};
