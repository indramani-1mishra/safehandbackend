const EquipmentOrder = require("../modals/EquipmentOrder");

const createOrderService = async (orderData) => {
    return await EquipmentOrder.create(orderData);
};

const getUserOrdersService = async (userId) => {
    return await EquipmentOrder.find({ userId })
        .populate("equipmentId")
        .sort({ createdAt: -1 });
};

const getAllOrdersService = async (query = {}) => {
    return await EquipmentOrder.find(query)
        .populate("userId", "name email phone")
        .populate("equipmentId")
        .sort({ createdAt: -1 });
};

const getOrderByIdService = async (orderId) => {
    const order = await EquipmentOrder.findById(orderId)
        .populate("userId", "name email phone")
        .populate("equipmentId");
    if (!order) {
        throw new Error("Order not found");
    }
    return order;
};

const updateOrderStatusService = async (orderId, status) => {
    const order = await EquipmentOrder.findByIdAndUpdate(
        orderId, 
        { status }, 
        { new: true }
    );
    if (!order) {
        throw new Error("Order not found");
    }
    return order;
};

module.exports = {
    createOrderService,
    getUserOrdersService,
    getAllOrdersService,
    getOrderByIdService,
    updateOrderStatusService
};
