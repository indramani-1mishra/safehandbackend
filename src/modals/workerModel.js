const mongoose = require("mongoose");

const workerSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        trim: true
    },

    photo: {
        type: String
    },

    phone: {
        type: String,
        required: true
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
        default: false
    },

    isBusy: {
        type: Boolean,
        default: false
    }

}, { timestamps: true });

module.exports = mongoose.model("Worker", workerSchema);