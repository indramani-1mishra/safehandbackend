const mongoose = require("mongoose");

const productOrderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Client",
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    totalPrice: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
        default: "pending"
    },
    shippingAddress: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    contactNumber: {
        type: String,
        required: true
    },
    paymentId: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model("ProductOrder", productOrderSchema);
