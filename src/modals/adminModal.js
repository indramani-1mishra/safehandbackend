const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({

    // Basic Info
    name: {
        type: String,
        required: true,
        trim: true
    },

    phone: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    // Roles
    role: {
        type: String,
        enum: [
            "admin",
            "hr",
            "staff"
        ],
        default: "staff"
    },

    permissions: [

        {
            module: {
                type: String,
                
            },

            actions: [{
                type: String,
                enum: [
                    "create",
                    "view",
                    "edit",
                    "delete",
                    "assign",
                    "approve",
                    "export"
                ]
            }]
        }

    ],


    // Account Status
    isActive: {
        type: Boolean,
        default: true
    },

    isEmailVerified: {
        type: Boolean,
        default: false
    },

    isPhoneVerified: {
        type: Boolean,
        default: false
    },


    // OTP
    otp: {
        type: String,
        default: null,
        select: false
    },

    otpExpires: {
        type: Date,
        default: null
    },

    lastOtpSentAt: {
        type: Date,
        default: null
    },


    // Login Security
    loginAttempts: {
        type: Number,
        default: 0
    },

    lockUntil: {
        type: Date,
        default: null
    },

    lastLogin: {
        type: Date,
        default: null
    },


    // Tokens
    refreshToken: {
        type: String,
        default: null,
        select: false
    },


    // Tracking
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
        default: null
    },

    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
        default: null
    },
    accountStatus: {
        type: String,
        enum: ["pending", "active", "deactivated"],
        default: "pending"
    }

}, { timestamps: true });


module.exports =
mongoose.model("Admin", adminSchema);