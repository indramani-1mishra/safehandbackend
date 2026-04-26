const mongoose = require("mongoose");

const WorkerPayoutSchema = new mongoose.Schema({
    workerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Worker",
        required: true,
        index: true
    },
    jobCardId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "JobCard",
        required: true,
        index: true
    },
    amount: {
        type: Number,
        required: true
    },
    payoutDate: {
        type: Date,
        default: Date.now
    },
    paymentMethod: {
        type: String,
        enum: ["cash", "upi", "bank_transfer"],
        default: "upi"
    },
    transactionId: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ["pending", "paid", "failed"],
        default: "paid"
    },
    paidFromDate: {
        type: Date
    },
    paidUntilDate: {
        type: Date
    },
    remarks: {
        type: String,
        trim: true
    }
}, { timestamps: true });

module.exports = mongoose.model("WorkerPayout", WorkerPayoutSchema);