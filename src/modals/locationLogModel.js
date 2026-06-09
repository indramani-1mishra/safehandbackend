const mongoose = require("mongoose");

const locationLogSchema = new mongoose.Schema({
    requestId: { type: String, required: true, unique: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'targetType' },
    targetType: { type: String, required: true, enum: ['Worker', 'Client'] },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
}, { timestamps: true });

module.exports = mongoose.model("LocationLog", locationLogSchema);
