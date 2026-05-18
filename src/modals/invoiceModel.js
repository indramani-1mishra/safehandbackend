const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: Number,
      unique: true,
    
    },

    jobcard: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobCard",
      required: true
    },

    clientPayment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClientPayment",
      required: true
    },
    invoicepdf: {
      type: String,
      default: ""
    },
    invoiceDate: {
      type: Date,
      default: Date.now
    },

  },
  {
    timestamps: true
  }

);

invoiceSchema.pre("save", async function () {
  if (this.isNew) {
    const lastInvoice = await mongoose
      .model("Invoice")
      .findOne()
      .sort({ invoiceNumber: -1 });

    this.invoiceNumber = lastInvoice
      ? lastInvoice.invoiceNumber + 1
      : 101;
  }
});

const Invoice = mongoose.model("Invoice", invoiceSchema);

module.exports = Invoice;