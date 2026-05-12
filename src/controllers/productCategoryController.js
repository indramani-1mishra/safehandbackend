const productCategoryService = require("../services/productCategoryService");

const createCategoryController = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ success: false, message: "Name is required" });
        if (!req.file) return res.status(400).json({ success: false, message: "Image is required" });

        const image = req.file.location || req.file.path;
        const category = await productCategoryService.createCategory({ name, image });
        
        res.status(201).json({ success: true, message: "Category created", data: category });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const getAllCategoriesController = async (req, res) => {
    try {
        const categories = await productCategoryService.getAllCategories();
        res.status(200).json({ success: true, data: categories });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateCategoryController = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };
        if (req.file) {
            updateData.image = req.file.location || req.file.path;
        }

        const updatedCategory = await productCategoryService.updateCategory(id, updateData);
        if (!updatedCategory) return res.status(404).json({ success: false, message: "Category not found" });

        res.status(200).json({ success: true, message: "Category updated", data: updatedCategory });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const deleteCategoryController = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await productCategoryService.deleteCategory(id);
        if (!deleted) return res.status(404).json({ success: false, message: "Category not found" });

        res.status(200).json({ success: true, message: "Category deleted" });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = {
    createCategoryController,
    getAllCategoriesController,
    updateCategoryController,
    deleteCategoryController
};
