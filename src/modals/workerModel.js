const mongoose = require("mongoose");
const Counter = require("./counterModel");

const workerSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        trim: true
    },

    workerId: {
        type: String,
        unique: true,
        index: true
    },

    photo: {
        type: String
    },

    phone: {
        type: String,
        required: true,
        unique: true,
        index: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },

    age: {
        type: Number,
        min: 18
    },

    gender: {
        type: String,
        enum: ["male", "female", "other"]
    },

    city: {
        type: String
    },

    services: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service"
    }],

    documents: [{
        type: String
    }],

    isActive: {
        type: Boolean,
        default: true
    },


    isOnline: {
        type: Boolean,
        default: true
    },

    isBusy: {
        type: Boolean,
        default: false,
    },

    refreshToken: {
        type: String,
        default: null
    },
    otp: {
        type: String,
        default: null
    },
    otpExpires: {
        type: Date,
        default: () => Date.now() + 1 * 60 * 1000
    },
    isPhoneVerified: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        default: "worker"
    },

    fcmToken: { type: String, default: "" },


}, { timestamps: true });


// AUTO GENERATE workerId (safehand00001)
workerSchema.pre("save", async function () {
    if (this.workerId) return;

    try {
        const counter = await Counter.findOneAndUpdate(
            { id: "workerId" },
            { $inc: { seq: 1 } },
            { returnDocument: 'after', upsert: true }
        );

        this.workerId = "safehand" + String(counter.seq).padStart(5, "0");

    } catch (error) {
        throw error;
    }
});

// Removed broken password hashing hook as it was missing bcrypt import and password field.
// If password login is needed later, add password field to schema and import bcrypt.

module.exports = mongoose.model("Worker", workerSchema);