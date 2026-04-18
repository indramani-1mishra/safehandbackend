const upload = require("../middleware/multer");
const { getonlyservicenameandimage } = require("../repository/serviceRepository");
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
        const body = req.body || {};
        let serviceData = {};

        // ✅ Basic fields
        if (body.name) serviceData.name = body.name;
        if (body.description) serviceData.description = body.description;
        if (body.category) serviceData.category = body.category;

        // ✅ JSON fields parse
        const parseField = (field) => {
            if (!body[field]) return;
            return typeof body[field] === "string"
                ? JSON.parse(body[field])
                : body[field];
        };

        if (body.pricingByCity) {
            serviceData.pricingByCity = parseField("pricingByCity");
        }

        if (body.basicFeatures) {
            serviceData.basicFeatures = parseField("basicFeatures");
        }

        if (body.advanceFeatures) {
            serviceData.advanceFeatures = parseField("advanceFeatures");
        }

        if (body.addons) {
            serviceData.addons = parseField("addons");
        }

        // ✅ Image handling (only update if new file uploaded)
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

        // ❗ Check if anything to update
        if (Object.keys(serviceData).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No data provided for update"
            });
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

const getonlyservicenameandimagecontroller = async (req, res) => {
    try {
        const services = await getonlyservicenameandimage();
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
}

const getServiceByidandCityController = async (req, res) => {
    try {
        const { id, city } = req.params;

        const service = await serviceService.getServiceByidandCityService(id, city);
        return res.status(200).json({
            success: true,
            data: service,
            message: "Service fetched successfully"
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
}

const getallcitycontroller = async (req, res) => {
    try {
        const city = await serviceService.getallcityService();
        return res.status(200).json({
            success: true,
            data: city,
            message: "City fetched successfully"
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
}
module.exports = {
    uploadImages,
    createServiceController,
    updateServiceController,
    getAllServicesController,
    getServiceByIdController,
    deleteServiceController,
    getonlyservicenameandimagecontroller,
    getServiceByidandCityController,
    getallcitycontroller
};
