const Invoice = require("../modals/invoiceModel");

const createInvoice = async (data) => {
    return await Invoice.create(data);
};

const getInvoiceById = async (id) => {
    return await Invoice.findById(id)
        .populate("jobcard")
        .populate("clientPayment").sort({ createdAt: -1 });
};

const getInvoiceByInvoiceNumber = async (invoiceNumber) => {
    return await Invoice.findOne({ invoiceNumber })
        .populate("jobcard")
        .populate("clientPayment").sort({ createdAt: -1 });
};

const getInvoices = async (query = {}) => {
    const { page = 1, limit = 500, jobCardId, clientPaymentId, invoiceNumber, } = query;
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

const getInvoiceByDateRange = async (startDate, endDate) => {
    return await Invoice.find({
        createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        }
    })
        .populate("jobcard")
        .populate("clientPayment")
        .sort({ createdAt: -1 });
};

const getInvoiceByClientNameOrNumber = async (query) => {
    const { clientName, number } = query;
    
    // First, find jobcards matching the criteria
    const JobCard = require("../modals/jobcartModel");
    const matchingJobCards = await JobCard.find({
        $or: [
            { "patientDetails.name": { $regex: clientName, $options: "i" } },
            { "patientDetails.phone": { $regex: number, $options: "i" } }
        ]
    }).select("_id");
    
    const jobCardIds = matchingJobCards.map(jc => jc._id);
    
    // Then, find invoices with these jobcards
    return await Invoice.find({ jobcard: { $in: jobCardIds } })
        .populate("jobcard")
        .populate("clientPayment")
        .sort({ createdAt: -1 });
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
    deleteInvoice,
    getInvoiceByDateRange,
    getInvoiceByClientNameOrNumber
};
