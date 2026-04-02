const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const adminSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        trim: true
    },

    phone: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    password: {
        type: String,
        required: true,
        minlength: 6,
        select: false
    },

    role: {
        type: String,
        enum: ["admin", "staff"],
        default: "staff"
    },

    isActive: {
        type: Boolean,
        default: true
    },

    isEmailVerified: {
        type: Boolean,
        default: false
    },

    lastLogin: {
        type: Date,

    },

    loginAttempts: {
        type: Number,
        default: 0
    },

    lockUntil: {
        type: Date
    },

    refreshToken: {
        type: String
    }

}, { timestamps: true });


adminSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});


adminSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("Admin", adminSchema);