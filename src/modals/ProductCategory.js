const mongoose = require("mongoose");

const productCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String, // AWS S3 URL
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model("ProductCategory", productCategorySchema);
