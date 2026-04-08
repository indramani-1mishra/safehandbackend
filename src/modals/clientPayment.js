const mongoose = require("mongoose");

const ClientPaymentSchema = new mongoose.Schema({
    jobCardId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "JobCard",
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    paymentDate: {
        type: Date,
        default: Date.now
    },
    paymentMethod: {
        type: String,
        enum: ["cash", "card", "upi"],
        default: "cash"
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "paid", "failed"],
        default: "pending"
    },
    dayCovered: {
        type: Number,
        default: 0,
    },
    remainingAmount: {
        type: Number,
        required: true
    },
    remainingDays: {
        type: Number,
        default: 0
    },
    paidFromDate: {
        type: Date
    },
    paidUntilDate: {
        type: Date
    },
    reachLimit: {
        type: Boolean,
        default: false
    },
    overLimit: {
        type: Boolean,
        default: false
    },




})

module.exports = mongoose.model("ClientPayment", ClientPaymentSchema);
