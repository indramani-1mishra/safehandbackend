const mongoose = require("mongoose");
const Counter = require("./counterModel");

const workerSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        trim: true
    },

    workerId: {
        type: String,
        unique: true,
        index: true
    },

    photo: {
        type: String
    },

    phone: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },

    age: {
        type: Number,
        min: 18
    },

    gender: {
        type: String,
        enum: ["male", "female", "other"]
    },

    city: {
        type: String
    },

    services: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service"
    }],

    documents: [{
        type: String
    }],

    isActive: {
        type: Boolean,
        default: true
    },


    isOnline: {
        type: Boolean,
        default: false
    },

    isBusy: {
        type: Boolean,
        default: false
    },

    refreshToken: {
        type: String,
        default: null
    }

}, { timestamps: true });


// 🔥 AUTO GENERATE workerId (safehand00001)
workerSchema.pre("save", async function () {
    if (this.workerId) return;

    try {
        const counter = await Counter.findOneAndUpdate(
            { id: "workerId" },
            { $inc: { seq: 1 } },
            { returnDocument: 'after', upsert: true }
        );

        this.workerId = "safehand" + String(counter.seq).padStart(5, "0");

    } catch (error) {
        throw error;
    }
});

workerSchema.pre("save", async function () {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
        return;
    }
});

module.exports = mongoose.model("Worker", workerSchema);