const WorkerTransactionHistory = require("../modals/WorkerTransactionHistory");

const createTransaction = async (data) => {
    return await WorkerTransactionHistory.create(data);
};

const getAllTransactions = async () => {
    return await WorkerTransactionHistory.find()
        .sort({ createdAt: -1 })
        .populate("attendanceId")
        .populate("jobCardId")
        .populate("payoutId")
        .populate("workerId");
};

const getTransactionsByWorkerId = async (id) => {
    return await WorkerTransactionHistory.find({ workerId: id })
        .sort({ createdAt: -1 })
        .populate("attendanceId")
        .populate("jobCardId")
        .populate("payoutId")
        .populate("workerId");
};

const getTransactionsByJobCardId = async (id) => {
    return await WorkerTransactionHistory.find({ jobCardId: id })
        .sort({ createdAt: -1 })
        .populate("attendanceId")
        .populate("jobCardId")
        .populate("payoutId")
        .populate("workerId");
};

const getTransactionsByPatientName = async (name) => {
    return await WorkerTransactionHistory.aggregate([
        {
            $lookup: {
                from: "jobcards",
                localField: "jobCardId",
                foreignField: "_id",
                as: "jobCard"
            }
        },
        {
            $unwind: "$jobCard"
        },
        {
            $match: {
                "jobCard.patientDetails.name": {
                    $regex: name,
                    $options: "i"
                }
            }
        }
    ]);
};

const getTransactionsByWorkerName = async (name) => {
    return await WorkerTransactionHistory.aggregate([
        {
            $lookup: {
                from: "workers",
                localField: "workerId",
                foreignField: "_id",
                as: "worker"
            }
        },
        {
            $unwind: "$worker"
        },
        {
            $match: {
                "worker.name": {
                    $regex: name,
                    $options: "i"
                }
            }
        }
    ]);
};

const getTransactionById = async (id) => {
    return await WorkerTransactionHistory.findById(id);
};

const updateTransaction = async (id, data) => {
    return await WorkerTransactionHistory.findByIdAndUpdate(id, data, { returnDocument: "after" });
};

const deleteTransaction = async (id) => {
    return await WorkerTransactionHistory.findByIdAndDelete(id);
};

module.exports = {
    createTransaction,
    getAllTransactions,
    getTransactionById,
    updateTransaction,
    deleteTransaction,
    getTransactionsByPatientName,
    getTransactionsByWorkerName,
    getTransactionsByWorkerId,
    getTransactionsByJobCardId
};
