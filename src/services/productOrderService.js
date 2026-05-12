const ProductOrder = require("../modals/ProductOrder");
const Product = require("../modals/Product");

const createDirectBuyOrder = async (userId, data) => {
    const { productId, quantity, shippingAddress, city, contactNumber, paymentId } = data;

    if (!productId || !quantity || !shippingAddress || !city || !contactNumber || !paymentId) {
        throw new Error("Missing required fields for direct buy");
    }

    const product = await Product.findById(productId);
    if (!product) {
        throw new Error("Product not found");
    }

    if (product.availableQuantity < quantity) {
        throw new Error(`Out of Stock! Only ${product.availableQuantity} items available.`);
    }

    // Deduct inventory
    product.availableQuantity -= quantity;
    await product.save();

    // Create Order
    const totalPrice = product.price * quantity;
    const order = await ProductOrder.create({
        userId,
        productId,
        quantity,
        totalPrice,
        shippingAddress,
        city,
        contactNumber,
        paymentId,
        status: "pending"
    });

    return order;
};

const getUserOrders = async (userId) => {
    return await ProductOrder.find({ userId }).populate("productId").sort({ createdAt: -1 });
};

const getAllOrders = async () => {
    return await ProductOrder.find().populate("productId userId").sort({ createdAt: -1 });
};

const updateOrderStatus = async (orderId, status) => {
    return await ProductOrder.findByIdAndUpdate(orderId, { status }, { new: true });
};

module.exports = {
    createDirectBuyOrder,
    getUserOrders,
    getAllOrders,
    updateOrderStatus
};
