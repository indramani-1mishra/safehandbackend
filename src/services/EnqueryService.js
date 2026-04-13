const enqueryRepository = require("../repository/enqueryRepository");
const { sendMailOnAdmin } = require("../utils/sendmailonAdmin");
const { sendGreetToCoustomer } = require("../utils/sendGreetToCoustomer");
const createEnquiryService = async (data) => {
    // Validations
    if (data.phone && !/^\d{10}$/.test(data.phone)) {
        throw new Error("Phone must be 10 digits");
    }

    if (data.email && !/^\S+@\S+\.\S+$/.test(data.email)) {
        throw new Error("Invalid email format");
    }

    // Specific validation based on enquiry type
    if (data.enquiryType === "urgentEnquery") {
        if (!data.patientName || !data.address || !data.startDate) {
            throw new Error("Missing required fields for urgent enquiry");
        }
    } else if (data.enquiryType === "serviceEnquery") {
        if (!data.service || !data.serviceDuration) {
            throw new Error("Missing required fields for service enquiry");
        }
    }


    // Call the repository to save
    const result = await enqueryRepository.createEnquiry(data);
    await sendMailOnAdmin(data);
    if (!data.phone) {
        throw new Error("Missing required fields for service enquiry");
    }
    await sendGreetToCoustomer(data.phone, data.name);

    return result;
};

const updateEnquiryService = async (id, data) => {
    const enquiry = await enqueryRepository.getEnquiryById(id);
    if (!enquiry) {
        throw new Error("Enquiry not found");
    }

    return await enqueryRepository.updateEnquiry(id, data);
};

const updateEnquiryStatusService = async (id, status) => {
    const enquiry = await enqueryRepository.getEnquiryById(id);
    if (!enquiry) {
        throw new Error("Enquiry not found");
    }

    // Status validation
    const validStatuses = ["pending", "approved", "rejected"];
    if (!validStatuses.includes(status)) {
        throw new Error("Invalid status");
    }

    return await enqueryRepository.updateEnquiryStatus(id, status);
};

const getAllEnquiriesService = async (query) => {
    // If the query provides type or status, use the specialized filtered method
    if (query.type || query.status) {
        return await enqueryRepository.getEnquiries({ type: query.type, status: query.status });
    }
    return await enqueryRepository.getAllEnquiries(query);
};

const getEnquiryByIdService = async (id) => {
    return await enqueryRepository.getEnquiryById(id);
};

const deleteEnquiryService = async (id) => {
    const enquiry = await enqueryRepository.getEnquiryById(id);
    if (!enquiry) {
        throw new Error("Enquiry not found");
    }
    return await enqueryRepository.deleteEnquiry(id);
};

const getEnquiriesByStatusService = async (status) => {
    return await enqueryRepository.getEnquiryByStatus(status);
};

const getEnquiriesByTypeService = async (type) => {
    return await enqueryRepository.getEnquiryByType(type);
};

const getEnquiryByTypeAndStatusService = async (type, status) => {
    return await enqueryRepository.getEnquiries({ type, status });
};

const convertEnquiryStatusService = async (id, status) => {
    const enquiry = await enqueryRepository.getEnquiryById(id);
    if (!enquiry) {
        throw new Error("Enquiry not found");
    }
    const updateStatus = await enqueryRepository.updateEnquiryStatus(id, status);
    return updateStatus;
}

module.exports = {
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
};
