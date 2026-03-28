const JobCard = require("../modals/jobcartModel");

const createJobCard = async (data) => {
    const jobCard = new JobCard(data);
    return await jobCard.save();
};

const updateJobCard = async (id, data) => {
    return await JobCard.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true, runValidators: true }
    );
};

const deleteJobCard = async (id) => {
    return await JobCard.findByIdAndDelete(id);
};

const getAllJobCards = async (query = {}) => {
    const { page = 1, limit = 10 } = query;

    return await JobCard.find()
        .skip((page - 1) * limit)
        .limit(Number(limit));
};

const getJobCardById = async (id) => {
    const jobCard = await JobCard.findById(id);
    if (!jobCard) throw new Error("JobCard not found");
    return jobCard;
};

module.exports = {
    createJobCard,
    updateJobCard,
    deleteJobCard,
    getAllJobCards,
    getJobCardById
};
