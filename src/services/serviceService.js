const serviceRepository = require("../repository/serviceRepository");

/**
 * Creates a new service.
 */
const createServiceService = async (data) => {
    if (!data.name || !data.image || !data.subCategory) {
        throw new Error("Name, Image, and SubCategory are required");
    }
    return await serviceRepository.createService(data);
};

/**
 * Updates an existing service.
 */
const updateServiceService = async (id, data) => {
    const service = await serviceRepository.getServiceById(id);
    if (!service) {
        throw new Error("Service not found");
    }

    // Clean undefined/empty values
    const cleanedData = {};
    Object.keys(data).forEach((key) => {
        if (data[key] !== undefined && data[key] !== null && data[key] !== "") {
            cleanedData[key] = data[key];
        }
    });

    if (Object.keys(cleanedData).length === 0) {
        throw new Error("No valid fields provided for update");
    }

    return await serviceRepository.updateService(id, cleanedData);
};

/**
 * Gets all services with pagination and deep population.
 */
const getAllServicesService = async (query = {}) => {
    return await serviceRepository.getAllServices(query);
};

/**
 * Gets a service by its ID with full category/subcategory context.
 */
const getServiceByIdService = async (id) => {
    return await serviceRepository.getServiceById(id);
};

/**
 * Deletes a service.
 */
const deleteServiceService = async (id) => {
    const service = await serviceRepository.getServiceById(id);
    if (!service) {
        throw new Error("Service not found");
    }
    return await serviceRepository.deleteService(id);
};

/**
 * Gets services by SubCategory.
 */
const getServicesBySubCategoryService = async (subCategoryId) => {
    return await serviceRepository.getServiceBySubCategoryId(subCategoryId);
};

/**
 * Gets a specific service's price for a specific city.
 * Optimized to only return the relevant city's pricing info.
 */
const getServiceByidandCityService = async (id, city) => {
    if (!id || !city) {
        throw new Error("Service ID and City are required");
    }
    
    const service = await serviceRepository.getServiceByidandCity(id, city);
    if (!service) {
        throw new Error(`Service not available in ${city}`);
    }

    return service;
};

/**
 * Gets a unique list of all cities where services are available.
 */
const getallcityService = async () => {
    const cities = await serviceRepository.getallcity();
    if (!cities || cities.length === 0) {
        throw new Error("No service cities found");
    }
    return cities;
};

/**
 * Gets all services available in a specific city.
 */
const getServicesByCityService = async (city) => {
    return await serviceRepository.getServiceByCityName(city);
}

module.exports = {
    createServiceService,
    updateServiceService,
    getAllServicesService,
    getServiceByIdService,
    deleteServiceService,
    getServicesBySubCategoryService,
    getServiceByidandCityService,
    getallcityService,
    getServicesByCityService
};
