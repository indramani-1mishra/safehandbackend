const mongoose = require("mongoose");
const ClientPayment = require("../modals/clientPayment");

const createClientPayment = async (data) => {
    const clientPayment = new ClientPayment(data);
    return await clientPayment.save();
}

const updateClientPayment = async (id, data) => {
    const safeId = typeof id === 'string' ? id.trim() : id;
    return await ClientPayment.findByIdAndUpdate(
        safeId,
        { $set: data },
        { returnDocument: 'after', runValidators: true }
    );
}

const deleteClientPayment = async (id) => {
    const safeId = typeof id === 'string' ? id.trim() : id;
    return await ClientPayment.findByIdAndDelete(safeId);
}

const getAllClientPayments = async (query = {}) => {
    const { page = 1, limit = 50, search, ...filters } = query;

    let mongoQuery = { ...filters };

    // If search is present, we first find matching JobCards
    if (search) {
        const JobCard = mongoose.model("JobCard");
        const matchingJobs = await JobCard.find({
            $or: [
                { "patientDetails.name": { $regex: search, $options: "i" } },
                { "patientDetails.phone": { $regex: search, $options: "i" } }
            ]
        }).select("_id");

        const jobIds = matchingJobs.map(j => j._id);
        mongoQuery.jobCardId = { $in: jobIds };
    }

    if (filters.amount_gt !== undefined) {
        mongoQuery.amount = { $gt: Number(filters.amount_gt) };
        delete mongoQuery.amount_gt;
    }

    return await ClientPayment.find(mongoQuery)
        .populate({
            path: 'jobCardId',
            populate: [
                { path: 'workers.assigned', select: 'name phone' },
                { path: 'serviceDetails.service', select: 'name' }
            ]
        })
        .sort({ paymentDate: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));
}

const getClientPaymentById = async (id) => {
    const safeId = typeof id === 'string' ? id.trim() : id;
    const clientPayment = await ClientPayment.findById(safeId);
    if (!clientPayment) throw new Error("ClientPayment not found");
    return clientPayment;
}

const getClientPaymentsByJobCardId = async (jobCardId) => {
    const safeJobCardId = typeof jobCardId === 'string' ? jobCardId.trim() : jobCardId;
    return await ClientPayment.find({ jobCardId: safeJobCardId });
}

const getLatestClientPaymentByJobCardId = async (jobCardId) => {
    const safeJobCardId = typeof jobCardId === 'string' ? jobCardId.trim() : jobCardId;
    return await ClientPayment.findOne({ jobCardId: safeJobCardId }).sort({ paymentDate: -1, createdAt: -1, _id: -1 });
}

const getClientwithreachlimit = async () => {
    return await ClientPayment.find({ reachLimit: true });
}

const getClientwithoverlimit = async () => {
    return await ClientPayment.find({ overLimit: true });
}


const getReceivedPaymentByDate = async ({ startDate, endDate }) => {
    const receiveData = await ClientPayment.find({
        paymentDate: { $gte: startDate, $lte: endDate }
    })
        .populate({
            path: 'jobCardId',
            populate: { path: 'serviceDetails.service' }
        })
        .sort({ paymentDate: -1, createdAt: -1 })
        .lean();


    const totalAmount = receiveData.reduce((acc, curr) => acc + (curr.amount || 0), 0);

    return {
        receiveData,
        totalAmount,
        count: receiveData.length
    };
}

const pendingClientRemainingAmountbydate = async ({ startDate, endDate }) => {
    const clientsPendingAmount = await ClientPayment.find({
        paidUntilDate: { $gte: startDate, $lte: endDate }
    })
        .populate({
            path: 'jobCardId',
            populate: { path: 'serviceDetails.service' }
        })
        .sort({ paymentDate: -1, createdAt: -1 })
        .lean();

    const totalAmount = clientsPendingAmount.reduce((acc, curr) => acc + curr.remainingAmount, 0);
    return { clientsPendingAmount, totalAmount, count: clientsPendingAmount.length };
}

module.exports = {
    createClientPayment,
    updateClientPayment,
    deleteClientPayment,
    getAllClientPayments,
    getClientPaymentById,
    getClientPaymentsByJobCardId,
    getLatestClientPaymentByJobCardId,
    getClientwithreachlimit,
    getClientwithoverlimit,

    pendingClientRemainingAmountbydate,
    getReceivedPaymentByDate,


}