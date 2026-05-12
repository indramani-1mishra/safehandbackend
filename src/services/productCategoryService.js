const ProductCategory = require("../modals/ProductCategory");

const createCategory = async (data) => {
    return await ProductCategory.create(data);
};

const getAllCategories = async () => {
    return await ProductCategory.find().sort({ createdAt: -1 });
};

const getCategoryById = async (id) => {
    return await ProductCategory.findById(id);
};

const updateCategory = async (id, data) => {
    return await ProductCategory.findByIdAndUpdate(id, data, { new: true });
};

const deleteCategory = async (id) => {
    return await ProductCategory.findByIdAndDelete(id);
};

module.exports = {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
};
