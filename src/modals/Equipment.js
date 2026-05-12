const mongoose = require("mongoose");

const equipmentSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    pic: { type: String, required: true },
    description: { type: String, required: true },
    keys: [{ type: String }],
    rentPricePerMonth: { type: Number, required: true },
    purchasePrice: { type: Number, required: true },
    bookingAmount: { type: Number, default: 500 },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "EquipmentCategory",
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model("Equipment", equipmentSchema);
