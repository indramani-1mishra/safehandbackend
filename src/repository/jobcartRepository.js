const JobCard = require("../modals/jobcartModel");

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
        .skip((page - 1) * limit)
        .limit(Number(limit));
};

const getJobCardsByWorkerId = async (workerId) => {
    const safeWorkerId = typeof workerId === 'string' ? workerId.trim() : workerId;
    return await JobCard.find({ "workers.interested": safeWorkerId }).populate("workers.interested");
}

const addWorkerToJobCard = async (jobCardId, workerId) => {
    const safeJobCardId = typeof jobCardId === 'string' ? jobCardId.trim() : jobCardId;
    const safeWorkerId = typeof workerId === 'string' ? workerId.trim() : workerId;
    return await JobCard.findByIdAndUpdate(
        safeJobCardId,
        { $push: { "workers.interested": safeWorkerId } },
        { returnDocument: 'after', runValidators: true }
    ).populate("workers.interested");
}

const removeWorkerFromJobCard = async (jobCardId, workerId) => {
    const safeJobCardId = typeof jobCardId === 'string' ? jobCardId.trim() : jobCardId;
    const safeWorkerId = typeof workerId === 'string' ? workerId.trim() : workerId;
    return await JobCard.findByIdAndUpdate(
        safeJobCardId,
        { $pull: { "workers.interested": safeWorkerId } },
        { returnDocument: 'after', runValidators: true }
    );
}

const assignWorkerToJobCard = async (jobCardId, workerId) => {
    const safeJobCardId = typeof jobCardId === 'string' ? jobCardId.trim() : jobCardId;
    const safeWorkerId = typeof workerId === 'string' ? workerId.trim() : workerId;
    return await JobCard.findByIdAndUpdate(
        safeJobCardId,
        { $set: { "workers.assigned": safeWorkerId }, status: "assigned", isAssigned: true, },
        { returnDocument: 'after', runValidators: true }
    ).populate("workers.assigned");
}

const getJobCardById = async (id) => {
    const safeId = typeof id === 'string' ? id.trim() : id;
    const jobCard = await JobCard.findById(safeId);
    if (!jobCard) throw new Error("JobCard not found");
    return jobCard;
};




const getJobCardsByStatusAndWorkerId = async (status, workerId) => {
    const safeWorkerId = typeof workerId === 'string' ? workerId.trim() : workerId;

    return await JobCard.find({ status: status, "workers.assigned": safeWorkerId });
}
const completeJobCard = async (jobCardId) => {
    const safeJobCardId = typeof jobCardId === 'string' ? jobCardId.trim() : jobCardId;
    return await JobCard.findByIdAndUpdate(
        safeJobCardId,
        { $set: { status: "completed", completedAt: new Date(), isAssigned: "false" }, },
        { returnDocument: 'after', runValidators: true }
    ).populate("workers.assigned");
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
