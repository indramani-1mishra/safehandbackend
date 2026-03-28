const upload = require("../middleware/multer");
const serviceService = require("../services/serviceService");

// Multer middleware explicitly handling file uploads for Service fields
// Yaha model ki requiremnet ke hisab se hum 3 alag fields ko expect kar rhe hain.
const uploadImages = upload.fields([
    { name: "image", maxCount: 1 },
    { name: "basicImage", maxCount: 1 },
    { name: "advanceImage", maxCount: 1 }
]);

const createServiceController = async (req, res) => {
    try {
        const serviceData = { ...req.body };

        // Parse pricing or add-ons correctly if they come from formData (strings).
        // Since FormData often sets lists and objects as strings, make sure to parse them:
        if (serviceData.pricingByCity && typeof serviceData.pricingByCity === 'string') {
            serviceData.pricingByCity = JSON.parse(serviceData.pricingByCity);
        }
        if (serviceData.basicFeatures && typeof serviceData.basicFeatures === 'string') {
            serviceData.basicFeatures = JSON.parse(serviceData.basicFeatures);
        }
        if (serviceData.advanceFeatures && typeof serviceData.advanceFeatures === 'string') {
            serviceData.advanceFeatures = JSON.parse(serviceData.advanceFeatures);
        }
        if (serviceData.addons && typeof serviceData.addons === 'string') {
            serviceData.addons = JSON.parse(serviceData.addons);
        }

        // Handle File Upload mapping from Multer
        if (req.files) {
            if (req.files.image) {
                // req.files.image[0].location corresponds to AWS S3 URL created by multer-s3
                serviceData.image = req.files.image[0].location; 
            }
            if (req.files.basicImage) {
                serviceData.basicImage = req.files.basicImage[0].location;
            }
            if (req.files.advanceImage) {
                serviceData.advanceImage = req.files.advanceImage[0].location;
            }
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

        // Parse inputs similarly if sent via form-data
        if (serviceData.pricingByCity && typeof serviceData.pricingByCity === 'string') {
            serviceData.pricingByCity = JSON.parse(serviceData.pricingByCity);
        }
        if (serviceData.basicFeatures && typeof serviceData.basicFeatures === 'string') {
            serviceData.basicFeatures = JSON.parse(serviceData.basicFeatures);
        }
        if (serviceData.advanceFeatures && typeof serviceData.advanceFeatures === 'string') {
            serviceData.advanceFeatures = JSON.parse(serviceData.advanceFeatures);
        }
        if (serviceData.addons && typeof serviceData.addons === 'string') {
            serviceData.addons = JSON.parse(serviceData.addons);
        }

        // Apply any new image URLs over existing
        if (req.files) {
            if (req.files.image) {
                serviceData.image = req.files.image[0].location;
            }
            if (req.files.basicImage) {
                serviceData.basicImage = req.files.basicImage[0].location;
            }
            if (req.files.advanceImage) {
                serviceData.advanceImage = req.files.advanceImage[0].location;
            }
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

module.exports = {
    uploadImages,
    createServiceController,
    updateServiceController,
    getAllServicesController,
    getServiceByIdController,
    deleteServiceController
};
