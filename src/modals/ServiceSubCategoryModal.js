const mongoose = require("mongoose");

const serviceSubCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String,
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ServiceCategory",
        required: true
    },
    features: {
        type: [String],
        default: []
    },
}, { timestamps: true });

module.exports = mongoose.model("ServiceSubCategory", serviceSubCategorySchema);