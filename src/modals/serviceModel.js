const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({

    //  Basic Info
    name: {
        type: String,
        required: true,
        trim: true
    },

    image: {
        type: String,
        required: true
    },

    basicImage: {
        type: String
    },

    advanceImage: {
        type: String
    },
    category: {
        type: String,
    },
    description: {
        type: String
    },

    //  City-wise Pricing
    pricingByCity: [
        {
            city: {
                type: String,
                required: true
            },

            basic: {
                hr12: Number,
                hr24: Number
            },

            advance: {
                hr12: Number,
                hr24: Number
            }
        }
    ],

    //  Features
    basicFeatures: [String],
    advanceFeatures: [String],

    //  Add-ons
    addons: [
        {
            name: String,
            price: Number
        }
    ]

}, { timestamps: true });

module.exports = mongoose.model("Service", serviceSchema);