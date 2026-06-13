const JobPost = require("../modals/jobPost");
const mongoose = require("mongoose");

const createJobPost = async (data) => {
    const jobPost = new JobPost(data);
    return await jobPost.save();
};

const getJobPostById = async (id) => {
    const safeId = typeof id === 'string' ? id.trim() : id;
    return await JobPost.findById(safeId).populate("interested").populate("serviceId");
};

const getAllJobPosts = async (query = {}) => {
    const { page = 1, limit = 50 } = query;
    return await JobPost.find()
        .populate("interested")
        .populate("serviceId")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));
};

const updateJobPost = async (id, data) => {
    const safeId = typeof id === 'string' ? id.trim() : id;
    return await JobPost.findByIdAndUpdate(
        safeId,
        { $set: data },
        { returnDocument: 'after', runValidators: true }
    ).populate("interested").populate("serviceId");
};

const deleteJobPost = async (id) => {
    const safeId = typeof id === 'string' ? id.trim() : id;
    return await JobPost.findByIdAndDelete(safeId);
};

const addWorkerToInterested = async (jobPostId, workerId) => {
    const safeJobPostId = typeof jobPostId === 'string' ? jobPostId.trim() : jobPostId;
    const safeWorkerId = typeof workerId === 'string' ? workerId.trim() : workerId;

    return await JobPost.findByIdAndUpdate(
        safeJobPostId,
        { $addToSet: { interested: safeWorkerId } },
        { returnDocument: 'after', runValidators: true }
    ).populate("interested").populate("serviceId");
};

const removeWorkerFromInterested = async (jobPostId, workerId) => {
    const safeJobPostId = typeof jobPostId === 'string' ? jobPostId.trim() : jobPostId;
    const safeWorkerId = typeof workerId === 'string' ? workerId.trim() : workerId;

    return await JobPost.findByIdAndUpdate(
        safeJobPostId,
        { $pull: { interested: safeWorkerId } },
        { returnDocument: 'after', runValidators: true }
    ).populate("interested").populate("serviceId");
};

module.exports = {
    createJobPost,
    getJobPostById,
    getAllJobPosts,
    updateJobPost,
    deleteJobPost,
    addWorkerToInterested,
    removeWorkerFromInterested
};
