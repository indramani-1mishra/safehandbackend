const Enquiry = require("../modals/enqueryModel");

const createEnquiry = async (data) => {
    const enquiry = new Enquiry(data);
    return await enquiry.save();
};

const findEnquiryByEmail = async (email) => {
    return await Enquiry.findOne({ email });
};

const updateEnquiry = async (id, data) => {
    return await Enquiry.findByIdAndUpdate(
        id,
        { $set: data },
        { returnDocument: 'after', runValidators: true }
    );
};

const deleteEnquiry = async (id) => {
    return await Enquiry.findByIdAndDelete(id);
};

const getAllEnquiries = async (query = {}) => {
    const { page = 1, limit = 10 } = query;

    return await Enquiry.find()
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .sort({ createdAt: -1 });
};

const getEnquiryById = async (id) => {
    const enquiry = await Enquiry.findById(id);
    if (!enquiry) throw new Error("Enquiry not found");
    return enquiry;
};

const updateEnquiryStatus = async (id, status) => {
    return await Enquiry.findByIdAndUpdate(
        id,
        { $set: { status } },
        { returnDocument: 'after', runValidators: true }
    );

}
const getEnquiryByStatus = async (status) => {
    return await Enquiry.find({ status });
};

const getEnquiryByType = async (type) => {
    return await Enquiry.find({ enquiryType: type });
};

const getEnquiries = async ({ type, status, page = 1, limit = 10 }) => {
    const filter = {};

    if (type) filter.enquiryType = type;
    if (status) filter.status = status;

    return await Enquiry.find(filter)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .sort({ createdAt: -1 });
};

module.exports = {
    createEnquiry,
    findEnquiryByEmail,
    updateEnquiry,
    deleteEnquiry,
    getAllEnquiries,
    getEnquiryById,
    updateEnquiryStatus,
    getEnquiryByStatus,
    getEnquiryByType,
    getEnquiries
};
