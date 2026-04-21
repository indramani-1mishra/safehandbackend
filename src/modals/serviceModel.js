const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String,
        required: true
    },
    subCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ServiceSubCategory",
        required: true
    },
    //  Basic Info
    description: {
        type: String
    },
    features: {
        type: [String],
        default: []
    },
    //  City-wise Pricing
    cityAndPrice: [
        {
            city: { type: String, required: true },
            price: { type: Number, required: true }
        }
    ]

}, { timestamps: true });

module.exports = mongoose.model("Service", serviceSchema);