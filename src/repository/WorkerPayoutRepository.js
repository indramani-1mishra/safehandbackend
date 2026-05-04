const WorkerPayout = require("../modals/Workerpayeout");

const createWorkerPayout = async (data) => {
    const payout = new WorkerPayout(data);
    return await payout.save();
}

const getPayoutsByWorkerAndJob = async (workerId, jobCardId) => {
    return await WorkerPayout.find({ workerId, jobCardId }).sort({ createdAt: -1 })
}

const getAllPayoutsByWorker = async (workerId) => {
    return await WorkerPayout.find({ workerId }).populate("workerId").populate("jobCardId").sort({ createdAt: -1 });
}

const getPayoutById = async (id) => {
    return await WorkerPayout.findById(id).populate("workerId").populate("jobCardId");
}

const getAllPayouts = async () => {
    return await WorkerPayout.find().populate("workerId").populate("jobCardId").sort({ createdAt: -1 });
}




const updateWorkerPayout = async (id, data) => {
    return await WorkerPayout.findByIdAndUpdate(id, { $set: data }, { new: true });
}
// find worker by payout id
const getWorkerbyPayoutId = async (id) => {
    return await WorkerPayout.findById(id).populate("workerId").populate("jobCardId");
}

module.exports = {
    createWorkerPayout,
    getPayoutsByWorkerAndJob,
    getAllPayoutsByWorker,
    getPayoutById,
    getAllPayouts,
    updateWorkerPayout,
    getWorkerbyPayoutId
}
