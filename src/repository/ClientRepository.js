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
    const { page = 1, limit = 10 } = query;

    return await ClientPayment.find()
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
    getClientwithreachlimit,
    getClientwithoverlimit
}