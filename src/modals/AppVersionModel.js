const mongoose = require("mongoose");

const appVersionSchema = new mongoose.Schema(
    {
        platform: {
            type: String,
            required: true,
            enum: ["android", "ios"],
            unique: true,
            lowercase: true,
            trim: true,
        },

        latest_version: {
            type: String,
            required: true,
            trim: true,
        },

        minimum_version: {
            type: String,
            required: true,
            trim: true,
        },

        force_update: {
            type: Boolean,
            default: true,
        },

        play_store_url: {
            type: String,
            required: true,
            trim: true,
        },

        release_notes: {
            type: String,
            default: "Please update to the latest version to continue using the app.",
            trim: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("AppVersion", appVersionSchema);
