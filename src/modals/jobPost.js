const mongoose = require('mongoose');

const jobPostSchema = new mongoose.Schema({
    caption: {
        type: String,
        required: true,
    },
    image: {
        type: String,
    },
    video: {
        type: String,
    },
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
        default: null
    },
    interested: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Worker",
            default: null
        }
    ]
}, {
    timestamps: true
});

module.exports = mongoose.model("JobPost", jobPostSchema);