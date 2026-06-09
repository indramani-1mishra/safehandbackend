const mongoose = require("mongoose");

const ClientSchema = mongoose.Schema({
    name: {
        type: String,
        trim: true
    },
    image: {
        type: String,
        default: "https://cdn-icons-png.flaticon.com/512/149/149071.png"
    },
    phone: {
        type: String,
        required: [true, "Phone number is required"],
        unique: true,
        index: true
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
        sparse: true
    },
    isPhoneVerified: {
        type: Boolean,
        default: false
    },
    otp: {
        type: String,
    },
    otpExpires: {
        type: Date,
    },
    address: {
        type: String,
    },
    city: {
        type: String,
    },
    state: {
        type: String,
    },
    zip: {
        type: String,
    },
    country: {
        type: String,
        default: "India"
    },
    refreshToken: {
        type: String,
    },
    fcmToken: {
        type: String,
        default: ""
    },

}, { timestamps: true });


module.exports = mongoose.model("Client", ClientSchema);