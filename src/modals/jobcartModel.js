const mongoose = require("mongoose");

const jobCardSchema = new mongoose.Schema({

    // 🔹 Linked Enquiry / Inquiry
    inquiryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Enquiry",
        required: true
    },

    // 🔹 Patient Details
    patientDetails: {
        name: {
            type: String,
            required: true,
            trim: true
        },
        age: Number,
        gender: {
            type: String,
            enum: ["male", "female", "other"]
        },
        address: String,
        city: String,
        phone: String
    },

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
        duration: Number, // in hours/days
        timing: String    // e.g. "12hr", "24hr"
    },

    addons: [
        {
            name: String,
            price: {
                type: Number,
                default: 0
            }
        }
    ],

    totalPrice: {
        type: Number,
        default: 0
    },
    worker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Worker"
    },


    status: {
        type: String,
        enum: ["pending", "assigned", "in-progress", "completed", "cancelled"],
        default: "pending"
    },

    assignedAt: Date,
    completedAt: Date

}, { timestamps: true });

module.exports = mongoose.model("JobCard", jobCardSchema);
