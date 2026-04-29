const mongoose = require("mongoose");

const jobCardSchema = new mongoose.Schema({

    // 🔹 Inquiry Link
    inquiryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Enquiry",
        required: true
    },

    // 🔹 Patient Details
    patientDetails: {
        name: { type: String, required: true, trim: true },
        age: Number,
        gender: { type: String, enum: ["male", "female", "other"] },
        address: String,
        city: String,
        phone: String
    },

    // 🔹 Service Details
    serviceDetails: {
        service: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Service",
            required: true
        },
        plan: {
            type: String,
            enum: ["basic", "advance"],
            default: "basic"
        },
        timing: String // 12hr / 24hr
    },

    // 🔥 NEW (CORE LOGIC)
    serviceStart: {
        type: Date,
        required: true
    },
    serviceEnd: {
        type: Date,
        required: true
    },

    totalDays: Number,

    // 💰 CUSTOMER SIDE
    totalDealAmount: {
        type: Number,
        required: true
    },

    perDayCustomerCost: Number,

    customerPaymentCycleDays: Number, // 7 / 15 / 30

    // 👨‍⚕️ NURSE SIDE
    totalNurseSalary: {
        type: Number,
        required: true
    },

    perDayNurseCost: Number,

    nursePaymentCycleDays: Number,

    // 🔹 Workers
    workers: {
        interested: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Worker"
        }],
        assigned: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Worker",
            default: null
        }
    },

    // 🔹 Status
    status: {
        type: String,
        enum: ["pending", "assigned", "ongoing", "completed"],
        default: "pending"
    },

    // 🔹 Tracking
    isAssigned: {
        type: Boolean,
        default: false
    },

    isDirectAssignWorker: {
        type: Boolean,
        default: false
    },
    requirementsofthepatient: {
        type: String,
        default: ""
    },



    assignedAt: Date,
    completedAt: Date

}, { timestamps: true });

module.exports = mongoose.model("JobCard", jobCardSchema);