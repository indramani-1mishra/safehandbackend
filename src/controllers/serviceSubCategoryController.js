const serviceSubCategoryService = require("../services/ServiceSubCategoryService");

const createServiceSubCategoryController = async (req, res) => {
    try {
        const data = { ...req.body };
        if (req.file) {
            data.image = req.file.location;
        }
        if (data.features && typeof data.features === 'string') {
            data.features = JSON.parse(data.features);
        }
        const subCategory = await serviceSubCategoryService.createServiceSubCategoryService(data);
        res.status(201).json({ success: true, message: "SubCategory created", data: subCategory });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const getAllServiceSubCategoriesController = async (req, res) => {
    try {
        const subCategories = await serviceSubCategoryService.getAllServiceSubCategoriesService();
        res.status(200).json({ success: true, data: subCategories });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const getServiceSubCategoryByCategoryIdController = async (req, res) => {
    try {
        const subCategories = await serviceSubCategoryService.getServiceSubCategoryByCategoryIdService(req.params.categoryId);
        res.status(200).json({ success: true, data: subCategories });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const getServiceSubCategoryByIdController = async (req, res) => {
    try {
        const subCategory = await serviceSubCategoryService.getServiceSubCategoryByIdService(req.params.id);
        res.status(200).json({ success: true, data: subCategory });
    } catch (error) {
        res.status(404).json({ success: false, message: error.message });
    }
};

const updateServiceSubCategoryController = async (req, res) => {
    try {
        const data = { ...req.body };
        if (req.file) {
            data.image = req.file.location;
        }
        if (data.features && typeof data.features === 'string') {
            data.features = JSON.parse(data.features);
        }
        const subCategory = await serviceSubCategoryService.updateServiceSubCategoryService(req.params.id, data);
        res.status(200).json({ success: true, message: "SubCategory updated", data: subCategory });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const deleteServiceSubCategoryController = async (req, res) => {
    try {
        await serviceSubCategoryService.deleteServiceSubCategoryService(req.params.id);
        res.status(200).json({ success: true, message: "SubCategory deleted" });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = {
    createServiceSubCategoryController,
    getAllServiceSubCategoriesController,
    getServiceSubCategoryByCategoryIdController,
    getServiceSubCategoryByIdController,
    updateServiceSubCategoryController,
    deleteServiceSubCategoryController
};
