const {
    createEnquiryService,
    updateEnquiryService,
    updateEnquiryStatusService,
    getAllEnquiriesService,
    getEnquiryByIdService,
    deleteEnquiryService,
    getEnquiriesByStatusService,
    getEnquiriesByTypeService,
    getEnquiryByTypeAndStatusService,
    convertEnquiryStatusService
} = require("../services/EnqueryService");

const createEnquiry = async (req, res) => {
    try {
        const enquiry = await createEnquiryService(req.body);
        res.status(201).json({ success: true, message: "Enquiry created successfully", data: enquiry });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const updateEnquiry = async (req, res) => {
    try {
        const { id } = req.params;
        const enquiry = await updateEnquiryService(id, req.body);
        res.status(200).json({ success: true, message: "Enquiry updated successfully", data: enquiry });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const updateEnquiryStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const enquiry = await updateEnquiryStatusService(id, status);
        res.status(200).json({ success: true, message: "Enquiry status updated successfully", data: enquiry });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const getAllEnquiries = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const enquiries = await getAllEnquiriesService(req.query, page, limit);
        res.status(200).json({ success: true, data: enquiries });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getEnquiryById = async (req, res) => {
    try {
        const { id } = req.params;
        const enquiry = await getEnquiryByIdService(id);
        if (!enquiry) {
            return res.status(404).json({ success: false, message: "Enquiry not found" });
        }
        res.status(200).json({ success: true, data: enquiry });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteEnquiry = async (req, res) => {
    try {
        const { id } = req.params;
        await deleteEnquiryService(id);
        res.status(200).json({ success: true, message: "Enquiry deleted successfully" });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const getEnquiriesByStatus = async (req, res) => {
    try {
        const { status } = req.params;
        const enquiries = await getEnquiriesByStatusService(status);
        res.status(200).json({ success: true, data: enquiries });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getEnquiriesByType = async (req, res) => {
    try {
        const { type } = req.params;
        const enquiries = await getEnquiriesByTypeService(type);
        res.status(200).json({ success: true, data: enquiries });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getEnquiryByTypeAndStatus = async (req, res) => {
    try {
        const { type, status } = req.params;
        const enquiries = await getEnquiryByTypeAndStatusService(type, status);
        res.status(200).json({ success: true, data: enquiries });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const convertEnquiryStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const enquiry = await convertEnquiryStatusService(id, status);
        res.status(200).json({ success: true, message: "Enquiry status updated successfully", data: enquiry });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = {
    createEnquiry,
    updateEnquiry,
    updateEnquiryStatus,
    getAllEnquiries,
    getEnquiryById,
    deleteEnquiry,
    getEnquiriesByStatus,
    getEnquiriesByType,
    getEnquiryByTypeAndStatus,
    convertEnquiryStatus
};
