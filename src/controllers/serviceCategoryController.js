const serviceCategoryService = require("../services/ServiceCategoryService");

const createServiceCategoryController = async (req, res) => {
    try {
        const data = { ...req.body };
        if (req.file) {
            data.image = req.file.location;
        }
        const category = await serviceCategoryService.createServiceCategoryService(data);
        res.status(201).json({ success: true, message: "Category created", data: category });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const getAllServiceCategoriesController = async (req, res) => {
    try {
        const categories = await serviceCategoryService.getAllServiceCategoriesService();
        res.status(200).json({ success: true, data: categories });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const getServiceCategoryByIdController = async (req, res) => {
    try {
        const category = await serviceCategoryService.getServiceCategoryByIdService(req.params.id);
        res.status(200).json({ success: true, data: category });
    } catch (error) {
        res.status(404).json({ success: false, message: error.message });
    }
};

const updateServiceCategoryController = async (req, res) => {
    try {
        const data = { ...req.body };
        if (req.file) {
            data.image = req.file.location;
        }
        const category = await serviceCategoryService.updateServiceCategoryService(req.params.id, data);
        res.status(200).json({ success: true, message: "Category updated", data: category });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const deleteServiceCategoryController = async (req, res) => {
    try {
        await serviceCategoryService.deleteServiceCategoryService(req.params.id);
        res.status(200).json({ success: true, message: "Category deleted" });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = {
    createServiceCategoryController,
    getAllServiceCategoriesController,
    getServiceCategoryByIdController,
    updateServiceCategoryController,
    deleteServiceCategoryController
};
