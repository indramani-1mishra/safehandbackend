const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    subCategoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProductSubCategory",
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ""
    },
    price: {
        type: Number,
        required: true
    },
    availableQuantity: {
        type: Number,
        required: true,
        default: 0
    },
    image: {
        type: String, // AWS S3 URL
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
