const serviceRepository = require("../repository/serviceRepository");

// Ensure service modal and repository match logic properly
const createServiceService = async (data) => {
    if (!data.name || !data.image) {
        throw new Error("Name and primary image are required");
    }

    return await serviceRepository.createService(data);
};

const updateServiceService = async (id, data) => {
    const service = await serviceRepository.getServiceById(id);

    if (!service) {
        throw new Error("Service not found");
    }

    //  Clean unwanted values
    const cleanedData = {};

    Object.keys(data).forEach((key) => {
        if (
            data[key] !== undefined &&
            data[key] !== null &&
            data[key] !== ""
        ) {
            cleanedData[key] = data[key];
        }
    });

    if (Object.keys(cleanedData).length === 0) {
        throw new Error("No valid fields provided for update");
    }

    return await serviceRepository.updateService(id, cleanedData);
};

const getAllServicesService = async (query = {}) => {
    return await serviceRepository.getAllServices(query);
};

const getServiceByIdService = async (id) => {
    return await serviceRepository.getServiceById(id);
};

const deleteServiceService = async (id) => {
    // Delete service check
    const service = await serviceRepository.getServiceById(id);
    if (!service) {
        throw new Error("Service not found to be deleted");
    }

    return await serviceRepository.deleteService(id);
};

module.exports = {
    createServiceService,
    updateServiceService,
    getAllServicesService,
    getServiceByIdService,
    deleteServiceService
};
