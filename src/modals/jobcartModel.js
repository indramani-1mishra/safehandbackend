const mongoose = require("mongoose");

const jobCardSchema = new mongoose.Schema({

    // 🔹 Inquiry Link
    inquiryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Enquiry",
        required: false,
        default: null
    },

    // 🔹 Patient Details
    patientDetails: {
        name: { type: String, required: true, trim: true },
        age: Number,
        gender: { type: String, enum: ["male", "female", "other"] },
        address: String,
        landmark: String,
        city: String,
        pincode: String,
        phone: String,
        alternateNumber: String,
        email: String,
        contactPersonName: String,
        height: Number,
        weight: Number,
        preferredStaff: String,
        surgeryHistory: String,
        confirmSlot: String,
        doctorPrescription: String,
        patientCondition: String,
        feedback: String
    },

    // 🔹 Service Details
    serviceDetails: {
        service: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Service",
            required: true
        },
        plan: {
            type: String,
            enum: ["basic", "advance"],
            default: "basic"
        },
        timing: String // 12hr / 24hr
    },

    // 🔥 NEW (CORE LOGIC)
    serviceStart: {
        type: Date,
        required: true
    },

    prefreredReligion: String,
    preferredShift: String,
    requestedSkills: [String],
    instruction: String,
    patientDescription: String,

    perDayCustomerCost: Number,

    customerPaymentCycleDays: Number, // 7 / 15 / 30

    // 👨‍⚕️ NURSE SIDE

    perDayNurseCost: Number,

    nursePaymentCycleDays: Number,

    // 🔹 Workers
    workers: {
        interested: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Worker"
        }],
        assigned: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Worker",
            default: null
        },
        replaced: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Worker"
        }]
    },

    // 🔹 Status
    status: {
        type: String,
        enum: ["pending", "assigned", "ongoing", "completed"],
        default: "pending"
    },

    // 🔹 Tracking
    isAssigned: {
        type: Boolean,
        default: false
    },

    isDirectAssignWorker: {
        type: Boolean,
        default: false
    },
    requirementsofthepatient: {
        type: String,
        default: ""
    },
    remark: {
        type: String,
        default: ""
    },
    checkInTime: {
        type: Date,
        default: null
    },
    checkOutTime: {
        type: Date,
        default: null
    },


    assignedAt: Date,
    completedAt: Date,

    // 🔹 For One-Time service tracking status
    ontimeTrackingstatus: {
        type: String,
        enum: ['booked', 'assigned', 'ontheway', 'reached', 'jobstart', 'jobcompleted'],
        default: 'booked'
    }
}, { timestamps: true });

module.exports = mongoose.model("JobCard", jobCardSchema);