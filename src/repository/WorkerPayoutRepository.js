const WorkerPayout = require("../modals/Workerpayeout");

const createWorkerPayout = async (data) => {
    const payout = new WorkerPayout(data);
    return await payout.save();
}

const getPayoutsByWorkerAndJob = async (workerId, jobCardId) => {
    return await WorkerPayout.find({ workerId, jobCardId }).sort({ createdAt: -1 })
}

const getLatestPaidPayoutByWorkerAndJob = async (workerId, jobCardId) => {
    return await WorkerPayout.findOne({ workerId, jobCardId, status: 'paid' })
        .sort({ payoutDate: -1, createdAt: -1 });
}

const getLatestPaidDeductionByWorkerAndJob = async (workerId, jobCardId) => {
    return await WorkerPayout.findOne({ workerId, jobCardId, status: 'paid', deductionAmount: { $gt: 0 } })
        .sort({ payoutDate: -1, createdAt: -1 });
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

const getAllPayoutByDate = async ({ startDate, endDate }) => {
    const payoutData = await WorkerPayout.find({
        payoutDate: { $gte: startDate, $lte: endDate }
    }).populate("workerId").populate("jobCardId").sort({ payoutDate: -1, createdAt: -1 });

    const totalAmount = payoutData.reduce((acc, curr) => acc + curr.amount, 0);
    return { payoutData, totalAmount };
}




const updateWorkerPayout = async (id, data) => {
    return await WorkerPayout.findByIdAndUpdate(id, { $set: data }, { returnDocument: 'after' });
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
    getLatestPaidPayoutByWorkerAndJob,
    getLatestPaidDeductionByWorkerAndJob,
    getAllPayouts,
    updateWorkerPayout,
    getWorkerbyPayoutId,
    getAllPayoutByDate
}
