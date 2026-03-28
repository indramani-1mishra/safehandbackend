const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema({

    // Enquiry Type
    enquiryType: {
        type: String,
        enum: ["quickEnquery", "urgentEnquery", "serviceEnquery"],
        default: "quickEnquery"
    },

    //  Common Fields (all types)
    name: String,
    email: String,
    phone: String,
    city: String,
    message: String,

    // Urgent ONLY fields
    patientName: {
        type: String,
        required: function () {
            return this.enquiryType === "urgentEnquery";
        }
    },
    age: {
        type: Number,
        required: function () {
            return this.enquiryType === "urgentEnquery";
        }
    },
    gender: {
        type: String,
        enum: ["male", "female", "other"],
        required: function () {
            return this.enquiryType === "urgentEnquery";
        }
    },
    address: {
        type: String,
        required: function () {
            return this.enquiryType === "urgentEnquery";
        }
    },
    pincode: {
        type: String,
        required: function () {
            return this.enquiryType === "urgentEnquery";
        }
    },
    patientCondition: {
        type: String,
        required: function () {
            return this.enquiryType === "urgentEnquery";
        }
    },
    startDate: {
        type: Date,
        required: function () {
            return this.enquiryType === "urgentEnquery";
        }
    },
    preferredStaff: {
        type: String,
        required: function () {
            return this.enquiryType === "urgentEnquery";
        }
    },
    paymentMode: {
        type: String,
        required: function () {
            return this.enquiryType === "urgentEnquery";
        }
    },
    alternateNumber: {
        type: String,
        required: function () {
            return this.enquiryType === "urgentEnquery";
        }
    },
    contactPersonName: {
        type: String,
        required: function () {
            return this.enquiryType === "urgentEnquery";
        }
    },

    // 🔹 Optional (can be used anywhere if needed)
    landmark: String,
    description: String,

    // 🔹 Service ONLY fields
    service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
        required: function () {
            return this.enquiryType === "serviceEnquery";
        }
    },
    serviceName: {
        type: String,
        required: function () {
            return this.enquiryType === "serviceEnquery";
        }
    },
    enquiryFor: {
        type: String,
        required: function () {
            return this.enquiryType === "serviceEnquery";
        }
    },
    serviceDuration: {
        type: Number,
        min: 7,
        required: function () {
            return this.enquiryType === "serviceEnquery";
        }
    },

    // 🔹 Status
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    }

}, { timestamps: true }); ``

module.exports = mongoose.model("Enquiry", enquirySchema);