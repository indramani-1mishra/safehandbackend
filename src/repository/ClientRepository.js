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
    const { page = 1, limit = 50, ...filters } = query;

    // Convert amount filter if present (e.g. amount[gt]=0)
    const mongoQuery = { ...filters };
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


module.exports = {
    createClientPayment,
    updateClientPayment,
    deleteClientPayment,
    getAllClientPayments,
    getClientPaymentById,
    getClientPaymentsByJobCardId,
    getLatestClientPaymentByJobCardId,
    getClientwithreachlimit,
    getClientwithoverlimit
}