const JobCard = require("../modals/jobcartModel");
const mongoose = require("mongoose");

const createJobCard = async (data) => {
    const jobCard = new JobCard(data);
    return await jobCard.save();
};

const updateJobCard = async (id, data) => {
    const safeId = typeof id === 'string' ? id.trim() : id;
    return await JobCard.findByIdAndUpdate(
        safeId,
        { $set: data },
        { returnDocument: 'after', runValidators: true }
    );
};

const deleteJobCard = async (id) => {
    const safeId = typeof id === 'string' ? id.trim() : id;
    return await JobCard.findByIdAndDelete(safeId);
};

const getAllJobCards = async (query = {}) => {
    const { page = 1, limit = 10 } = query;

    return await JobCard.find()
        .populate("workers.interested")
        .populate("workers.assigned")
        .populate("serviceDetails.service")
        .populate("inquiryId")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));
};

const getJobCardsByWorkerId = async (workerId) => {
    const safeWorkerId = typeof workerId === 'string' ? workerId.trim() : workerId;
    return await JobCard.find({ "workers.interested": safeWorkerId })
        .populate("workers.interested")
        .populate("workers.assigned")
        .populate("serviceDetails.service")
        .populate("inquiryId");
}

const addWorkerToJobCard = async (jobCardId, workerId) => {
    const safeJobCardId = typeof jobCardId === 'string' ? jobCardId.trim() : jobCardId;
    const safeWorkerId = typeof workerId === 'string' ? workerId.trim() : workerId;
    return await JobCard.findByIdAndUpdate(
        safeJobCardId,
        { $push: { "workers.interested": safeWorkerId } },
        { returnDocument: 'after', runValidators: true }
    )
        .populate("workers.interested")
        .populate("workers.assigned")
        .populate("serviceDetails.service")
        .populate("inquiryId");
}

const removeWorkerFromJobCard = async (jobCardId, workerId) => {
    const safeJobCardId = typeof jobCardId === 'string' ? jobCardId.trim() : jobCardId;
    const safeWorkerId = typeof workerId === 'string' ? workerId.trim() : workerId;
    return await JobCard.findByIdAndUpdate(
        safeJobCardId,
        { $pull: { "workers.interested": safeWorkerId } },
        { returnDocument: 'after', runValidators: true }
    )
        .populate("workers.interested")
        .populate("workers.assigned")
        .populate("serviceDetails.service")
        .populate("inquiryId");
}

const assignWorkerToJobCard = async (jobCardId, workerId) => {
    const safeJobCardId = typeof jobCardId === 'string' ? jobCardId.trim() : jobCardId;
    const safeWorkerId = typeof workerId === 'string' ? workerId.trim() : workerId;
    return await JobCard.findOneAndUpdate(
        { _id: safeJobCardId, isAssigned: false },
        { $set: { "workers.assigned": safeWorkerId }, status: "assigned", isAssigned: true, },
        { returnDocument: 'after', runValidators: true }
    )
        .populate("workers.interested")
        .populate("workers.assigned")
        .populate("serviceDetails.service")
        .populate("inquiryId");
}

const getJobCardById = async (id) => {
    const safeId = typeof id === 'string' ? id.trim() : id;
    const jobCard = await JobCard.findById(safeId)
        .populate("workers.interested")
        .populate("workers.assigned")
        .populate("serviceDetails.service")
        .populate("inquiryId");
    if (!jobCard) throw new Error("JobCard not found");
    return jobCard;
};

const getJobCardsByStatus = async (status, query = {}) => {
    const { page = 1, limit = 10 } = query;
    return await JobCard.find({ status: status })
        .populate("workers.interested")
        .populate("workers.assigned")
        .populate("serviceDetails.service")
        .populate("inquiryId")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));
};

const getJobCardsByStatusAndWorkerId = async (status, workerId) => {
    const safeWorkerId = typeof workerId === 'string' ? workerId.trim() : workerId;
    const workerObjectId = new mongoose.Types.ObjectId(safeWorkerId);

    return await JobCard.find({ status: status, "workers.assigned": workerObjectId })
        .populate("workers.interested")
        .populate("workers.assigned")
        .populate("serviceDetails.service")
        .populate("inquiryId")
        .sort({ createdAt: -1 });
}
const completeJobCard = async (jobCardId) => {
    const safeJobCardId = typeof jobCardId === 'string' ? jobCardId.trim() : jobCardId;
    return await JobCard.findByIdAndUpdate(
        safeJobCardId,
        { $set: { status: "completed", completedAt: new Date(), isAssigned: false }, },
        { returnDocument: 'after', runValidators: true }
    )
        .populate("workers.interested")
        .populate("workers.assigned")
        .populate("serviceDetails.service")
        .populate("inquiryId");
}

module.exports = {
    createJobCard,
    updateJobCard,
    deleteJobCard,
    getAllJobCards,
    getJobCardById,
    getJobCardsByWorkerId,
    addWorkerToJobCard,
    removeWorkerFromJobCard,
    assignWorkerToJobCard,
    getJobCardsByStatus,
    getJobCardsByStatusAndWorkerId,
    completeJobCard
};
