const Invoice = require("../modals/invoiceModel");

const createInvoice = async (data) => {
    return await Invoice.create(data);
};

const getInvoiceById = async (id) => {
    return await Invoice.findById(id)
        .populate("jobcard")
        .populate("clientPayment");
};

const getInvoiceByInvoiceNumber = async (invoiceNumber) => {
    return await Invoice.findOne({ invoiceNumber })
        .populate("jobcard")
        .populate("clientPayment");
};

const getInvoices = async (query = {}) => {
    const { page = 1, limit = 500, jobCardId, clientPaymentId, invoiceNumber } = query;
    const filter = {};

    if (jobCardId) filter.jobcard = jobCardId;
    if (clientPaymentId) filter.clientPayment = clientPaymentId;
    if (invoiceNumber) filter.invoiceNumber = invoiceNumber;

    return await Invoice.find(filter)
        .populate("jobcard")
        .populate("clientPayment")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));
};

const getInvoicesByJobCardId = async (jobCardId) => {
    return await Invoice.find({ jobcard: jobCardId })
        .populate("jobcard")
        .populate("clientPayment")
        .sort({ createdAt: -1 });
};

const getInvoicesByClientPaymentId = async (clientPaymentId) => {
    return await Invoice.find({ clientPayment: clientPaymentId })
        .populate("jobcard")
        .populate("clientPayment")
        .sort({ createdAt: -1 });
};

const getInvoiceByJobCardAndPayment = async (jobCardId, clientPaymentId) => {
    return await Invoice.findOne({ jobcard: jobCardId, clientPayment: clientPaymentId });
};

const updateInvoice = async (id, data) => {
    return await Invoice.findByIdAndUpdate(id, data, {
        returnDocument: "after",
        runValidators: true
    })
        .populate("jobcard")
        .populate("clientPayment");
};

const deleteInvoice = async (id) => {
    return await Invoice.findByIdAndDelete(id);
};

module.exports = {
    createInvoice,
    getInvoiceById,
    getInvoiceByInvoiceNumber,
    getInvoices,
    getInvoicesByJobCardId,
    getInvoicesByClientPaymentId,
    getInvoiceByJobCardAndPayment,
    updateInvoice,
    deleteInvoice
};
