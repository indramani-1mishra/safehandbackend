const WorkerPayout = require("../modals/Workerpayeout");

const createWorkerPayout = async (data) => {
    const payout = new WorkerPayout(data);
    return await payout.save();
}

const getPayoutsByWorkerAndJob = async (workerId, jobCardId) => {
    return await WorkerPayout.find({ workerId, jobCardId })
}

const getAllPayoutsByWorker = async (workerId) => {
    return await WorkerPayout.find({ workerId })
}

const getPayoutById = async (id) => {
    return await WorkerPayout.findById(id);
}

const getAllPayouts = async () => {
    return await WorkerPayout.find();
}




module.exports = {
    createWorkerPayout,
    getPayoutsByWorkerAndJob,
    getAllPayoutsByWorker,
    getPayoutById,
    getAllPayouts
}
