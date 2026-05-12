const mongoose = require("mongoose");

const productSubCategorySchema = new mongoose.Schema({
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProductCategory",
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
    image: {
        type: String, // AWS S3 URL
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model("ProductSubCategory", productSubCategorySchema);
