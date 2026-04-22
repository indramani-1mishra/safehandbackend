const upload = require("../middleware/multer");
const serviceService = require("../services/serviceService");

// Multer middleware for Service image
const uploadImages = upload.fields([
    { name: "image", maxCount: 1 }
]);

const createServiceController = async (req, res) => {
    try {
        const serviceData = { ...req.body };

        // Parse JSON fields from FormData
        if (serviceData.cityAndPrice && typeof serviceData.cityAndPrice === 'string') {
            serviceData.cityAndPrice = JSON.parse(serviceData.cityAndPrice);
        }
        if (serviceData.features && typeof serviceData.features === 'string') {
            serviceData.features = JSON.parse(serviceData.features);
        }

        // Handle File Upload mapping
        if (req.files && req.files.image) {
            serviceData.image = req.files.image[0].location;
        }

        const newService = await serviceService.createServiceService(serviceData);

        return res.status(201).json({
            success: true,
            message: "Service created successfully",
            data: newService
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const updateServiceController = async (req, res) => {
    try {
        const { id } = req.params;
        const serviceData = { ...req.body };

        // Parse JSON fields
        if (serviceData.cityAndPrice && typeof serviceData.cityAndPrice === 'string') {
            serviceData.cityAndPrice = JSON.parse(serviceData.cityAndPrice);
        }
        if (serviceData.features && typeof serviceData.features === 'string') {
            serviceData.features = JSON.parse(serviceData.features);
        }

        // Image handling
        if (req.files && req.files.image) {
            serviceData.image = req.files.image[0].location;
        }

        const updatedService = await serviceService.updateServiceService(id, serviceData);

        return res.status(200).json({
            success: true,
            message: "Service updated successfully",
            data: updatedService
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const getAllServicesController = async (req, res) => {
    try {
        const services = await serviceService.getAllServicesService(req.query);
        return res.status(200).json({
            success: true,
            data: services
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const getServiceByIdController = async (req, res) => {
    try {
        const { id } = req.params;
        const service = await serviceService.getServiceByIdService(id);
        return res.status(200).json({
            success: true,
            data: service
        });
    } catch (error) {
        return res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

const deleteServiceController = async (req, res) => {
    try {
        const { id } = req.params;
        await serviceService.deleteServiceService(id);
        return res.status(200).json({
            success: true,
            message: "Service deleted successfully"
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const getServiceByidandCityController = async (req, res) => {
    try {
        const { id, city } = req.params;
        const service = await serviceService.getServiceByidandCityService(id, city);
        return res.status(200).json({
            success: true,
            data: service,
            message: "Service pricing fetched successfully"
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const getallcitycontroller = async (req, res) => {
    try {
        const cities = await serviceService.getallcityService();
        return res.status(200).json({
            success: true,
            data: cities
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const getServicesBySubCategoryController = async (req, res) => {
    try {
        const { subCategoryId } = req.params;
        const services = await serviceService.getServicesBySubCategoryService(subCategoryId);
        return res.status(200).json({
            success: true,
            data: services
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const getServiceByCityandSubCategoryIdController = async (req, res) => {
    try {
        const { city, subCategoryId } = req.params;
        const service = await serviceService.getServiceByCityandSubCategoryIdService(city, subCategoryId);
        return res.status(200).json({
            success: true,
            data: service,
            message: "Service fetched successfully for city and subcategory"
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    uploadImages,
    createServiceController,
    updateServiceController,
    getAllServicesController,
    getServiceByIdController,
    deleteServiceController,
    getServiceByidandCityController,
    getallcitycontroller,
    getServicesBySubCategoryController,
    getServiceByCityandSubCategoryIdController
};
