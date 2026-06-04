const mongoose = require("mongoose");

const workerTransactionSchema = new mongoose.Schema({
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
    attendanceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Attendance",
        index: true
    },
    payoutId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "WorkerPayout",
        index: true
    },
    amount: {
        type: Number,
        required: true
    },
    transactionDate: {
        type: Date,
        default: Date.now
    },
    transactionType: {
        type: String,
        enum: ["created_attendance", "paid_payout", "cancelled_payout", "bonus", "deduction"],
        required: true
    },
    status: {
        type: String,
        enum: ["credited", "debited"],

    },
    balanceAfterTransaction: {
        type: Number,
        required: true
    },
    globalAvailableBalance: {
        type: Number,

    }
}, { timestamps: true });

module.exports = mongoose.model("WorkerTransactionHistory", workerTransactionSchema);