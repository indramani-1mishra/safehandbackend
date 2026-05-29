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
        type: String,
        default: `https://ui-avatars.com/api/?name=${this.name}&background=random&color=fff`

    },

    phone: {
        type: String,
        required: true,
        unique: true,
        index: true
    },

    email: {
        type: String,
        unique: true,
        sparse: true,
        lowercase: true,
        trim: true
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
    prefer_city: {
        type: String,
        default: ""
    },
    Religion: {
        type: String,
    },
    fcmToken: { type: String, default: "" },
    bankName: { type: String, default: "" },
    accountNumber: { type: String, default: "" },
    ifscCode: { type: String, default: "" },
    accountHolderName: { type: String, default: "" },
    upiId: { type: String, default: "" },
    scanner: { type: String, default: "" },
    skills: [String],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin"
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin"
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin"
    },
    availableBalance: {
        type: Number,
        default: 0
    },
    workerBookingSlot: {
        type: [
            {
                from: {
                    type: Number,
                    default: 0,
                },

                to: {
                    type: Number,
                    default: 0,
                },

                jobCardId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "JobCard",
                },

                status: {
                    type: String,
                    enum: ["pending", "ontheway", "working", "rejected"],
                    default: "pending",
                },

                preCheckInNotified: {
                    type: Boolean,
                    default: false,
                },

                lastNotifiedDate: {
                    type: String,
                    default: "",
                }
            },
        ],

        default: [],
    },



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

        this.workerId = "0404" + String(counter.seq).padStart(5, "0");

    } catch (error) {
        throw error;
    }
});

// Removed broken password hashing hook as it was missing bcrypt import and password field.
// If password login is needed later, add password field to schema and import bcrypt.

module.exports = mongoose.model("Worker", workerSchema);