const mongoose = require("mongoose");

const equipmentOrderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Client",
        required: true
    },
    equipmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Equipment",
        required: true
    },
    orderType: {
        type: String,
        enum: ["rent", "buy"],
        required: true
    },
    bookingAmountPaid: {
        type: Number,
        default: 500
    },
    status: {
        type: String,
        enum: ["pending", "confirmed", "shipped", "delivered", "returned", "cancelled"],
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
        type: String, // Optional tracking for razorpay, etc.
        default: ""
    }
}, { timestamps: true });

module.exports = mongoose.model("EquipmentOrder", equipmentOrderSchema);
