const enqueryRepository = require("../repository/enqueryRepository");
const { sendMailOnAdmin } = require("../utils/sendmailonAdmin");
const { sendGreetToCoustomer } = require("../utils/sendGreetToCoustomer");
const JobCard = require("../modals/jobcartModel");

const normalizeDateOnly = (value) => {
    if (!value) return new Date();
    if (typeof value === "string") {
        const datePart = value.split("T")[0];
        const [year, month, day] = datePart.split("-");
        if (year && month && day) {
            return new Date(Number(year), Number(month) - 1, Number(day));
        }
    }
    return new Date(value);
};

const createEnquiryService = async (data, user) => {
    // Validations
    console.log(data);
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
        if (!data.service || !data.preferredShift) {
            throw new Error("Missing required fields for service enquiry");
        }
    }

    if (!data.phone) {
        throw new Error("Missing required fields for service enquiry");
    }

    if (!data.name) {
        data.name = data.patientName || "Customer";
    }


    // Call the repository to save
    const result = await enqueryRepository.createEnquiry(data);
    const issend = await sendGreetToCoustomer(data.phone, data.name);
    const issend2 = await sendMailOnAdmin(data);
    console.log(issend, issend2);

    // 🔥 Automatically create a JobCard for direct service bookings (Bypassing Unified Cart)
    if (data.enquiryType === "serviceEnquery" && user) {
        try {
            await JobCard.create({
                inquiryId: result._id,
                patientDetails: {
                    name: data.patientName || data.name || "Patient",
                    age: data.age || 0,
                    gender: data.gender || "male",
                    address: data.address || "",
                    landmark: data.landmark || "",
                    city: data.city || "",
                    pincode: data.pincode || "",
                    phone: data.phone || "",
                    alternateNumber: data.alternateNumber || ""
                },
                serviceDetails: {
                    service: data.service,
                    plan: data.packageType || "basic",
                    timing: data.preferredShift && data.preferredShift.toLowerCase().includes("24hr") ? "24hr" : "12hr"
                },
                serviceStart: normalizeDateOnly(data.startDate) || new Date(),
                prefreredReligion: data.prefreredReligion || "",
                preferredShift: data.preferredShift || "",
                requestedSkills: data.requestedSkills || [],
                instruction: data.instruction || data.message || "",
                patientDescription: data.patientCondition || data.description || "",
                perDayCustomerCost: 0,
                customerPaymentCycleDays: 30,
                perDayNurseCost: 0,
                nursePaymentCycleDays: 30,
                status: "pending",
                isAssigned: false
            });

            // Auto-approve the enquiry since it's a direct booking
            await enqueryRepository.updateEnquiryStatus(result._id, "approved");
            result.status = "approved";

        } catch (error) {
            console.error("Error auto-creating JobCard from Direct Enquiry:", error);
        }
    }

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

const getAllEnquiriesService = async (query, page, limit) => {
    // If the query provides type or status, use the specialized filtered method
    if (query.type || query.status) {
        return await enqueryRepository.getEnquiries({ type: query.type, status: query.status, page, limit });
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
