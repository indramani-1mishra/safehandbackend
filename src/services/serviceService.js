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
    
    return await serviceRepository.updateService(id, data);
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
