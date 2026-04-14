const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({

    // 🔹 Kaun sa Worker hai?
    workerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Worker",
        required: true,
        //  index: true
    },

    // 🔹 Kaun sa Job chal raha hai?
    jobCardId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "JobCard",
        required: true,
        //  index: true
    },

    // 🔹 Aaj ki Date (YYYY-MM-DD format mein, taaki search easy rahe)
    date: {
        type: String, // Example: "2026-04-06"
        required: true
    },

    // 🔹 Verification Status
    status: {
        type: String,
        enum: ["present", "absent", "pending"],
        default: "pending" // OTP correct hote hi present ho jayega
    },

    // 🔹 Check-In Time (Actual verification timestamp)
    checkInTime: {
        type: Date,
        default: Date.now
    },

    // 🔹 OTP Verification Status
    otpVerified: {
        type: Boolean,
        default: true // Hum tabhi entry karenge jab OTP verify ho chuka hoga
    },

    // 🔹 Optional: GPS Coordinates (In case of future use)
    location: {
        latitude: { type: Number },
        longitude: { type: Number }
    }

}, { timestamps: true });

// 🔥 Unique Index: Ek worker, ek hi job ke liye, ek din mein 2 bar attendance na laga sake!
//attendanceSchema.index({ workerId: 1, jobCardId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
