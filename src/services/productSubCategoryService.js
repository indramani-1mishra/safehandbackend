const ProductSubCategory = require("../modals/ProductSubCategory");

const createSubCategory = async (data) => {
    return await ProductSubCategory.create(data);
};

const getAllSubCategories = async () => {
    return await ProductSubCategory.find().populate("categoryId").sort({ createdAt: -1 });
};

const getSubCategoriesByCategory = async (categoryId) => {
    return await ProductSubCategory.find({ categoryId }).sort({ createdAt: -1 });
};

const updateSubCategory = async (id, data) => {
    return await ProductSubCategory.findByIdAndUpdate(id, data, { new: true });
};

const deleteSubCategory = async (id) => {
    return await ProductSubCategory.findByIdAndDelete(id);
};

module.exports = {
    createSubCategory,
    getAllSubCategories,
    getSubCategoriesByCategory,
    updateSubCategory,
    deleteSubCategory
};
