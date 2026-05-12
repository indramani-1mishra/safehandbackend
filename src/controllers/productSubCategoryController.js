const productSubCategoryService = require("../services/productSubCategoryService");

const createSubCategoryController = async (req, res) => {
    try {
        const { categoryId, name, description } = req.body;
        if (!categoryId || !name) return res.status(400).json({ success: false, message: "categoryId and name are required" });
        if (!req.file) return res.status(400).json({ success: false, message: "Image is required" });

        const image = req.file.location || req.file.path;
        const subCategory = await productSubCategoryService.createSubCategory({ categoryId, name, description, image });
        
        res.status(201).json({ success: true, message: "SubCategory created", data: subCategory });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const getAllSubCategoriesController = async (req, res) => {
    try {
        const subcategories = await productSubCategoryService.getAllSubCategories();
        res.status(200).json({ success: true, data: subcategories });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getSubCategoriesByCategoryController = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const subcategories = await productSubCategoryService.getSubCategoriesByCategory(categoryId);
        res.status(200).json({ success: true, data: subcategories });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateSubCategoryController = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };
        if (req.file) {
            updateData.image = req.file.location || req.file.path;
        }

        const updatedSubCategory = await productSubCategoryService.updateSubCategory(id, updateData);
        if (!updatedSubCategory) return res.status(404).json({ success: false, message: "SubCategory not found" });

        res.status(200).json({ success: true, message: "SubCategory updated", data: updatedSubCategory });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const deleteSubCategoryController = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await productSubCategoryService.deleteSubCategory(id);
        if (!deleted) return res.status(404).json({ success: false, message: "SubCategory not found" });

        res.status(200).json({ success: true, message: "SubCategory deleted" });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = {
    createSubCategoryController,
    getAllSubCategoriesController,
    getSubCategoriesByCategoryController,
    updateSubCategoryController,
    deleteSubCategoryController
};
