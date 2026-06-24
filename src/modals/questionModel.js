const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
    questionText: {
        type: String,
        required: true,
        trim: true
    },
    options: {
        type: [String],
        validate: {
            validator: function(v) {
                return v && v.length === 4;
            },
            message: "A question must have exactly 4 options."
        },
        required: true
    },
    correctOptionIndex: {
        type: Number,
        required: true,
        min: 0,
        max: 3
    },
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model("Question", questionSchema);
