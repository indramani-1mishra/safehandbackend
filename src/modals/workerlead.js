const mongoose = require("mongoose");

const workerLeadSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String },
        phone: { type: String, required: true },
        selectedCity: { type: String },
        applyforposition: { type: String },
        exprience: { type: String },
        preferedLanguage: { type: String },
        status: {
            type: String,
            enum: ["new", "assigned", "converted", "closed"],
            default: "new",
        },
    },
    { timestamps: true }
);


const workerLeadModel = mongoose.model("WorkerLead", workerLeadSchema);




module.exports = workerLeadModel;