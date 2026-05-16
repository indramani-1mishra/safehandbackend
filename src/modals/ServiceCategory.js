const mongoose = require("mongoose");

const serviceCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    serviceType: {
        type: String,
        enum: ["package", "onetime"],
        required: true
    },
    image: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model("ServiceCategory", serviceCategorySchema);
