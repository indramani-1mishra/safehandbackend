const Product = require("../modals/Product");

const createProduct = async (data) => {
    return await Product.create(data);
};

const getAllProducts = async () => {
    return await Product.find().populate({
        path: "subCategoryId",
        populate: { path: "categoryId" }
    }).sort({ createdAt: -1 });
};

const getProductsBySubCategory = async (subCategoryId) => {
    return await Product.find({ subCategoryId }).sort({ createdAt: -1 });
};

const getProductById = async (id) => {
    return await Product.findById(id).populate({
        path: "subCategoryId",
        populate: { path: "categoryId" }
    });
};

const updateProduct = async (id, data) => {
    return await Product.findByIdAndUpdate(id, data, { new: true });
};

const deleteProduct = async (id) => {
    return await Product.findByIdAndDelete(id);
};

module.exports = {
    createProduct,
    getAllProducts,
    getProductsBySubCategory,
    getProductById,
    updateProduct,
    deleteProduct
};
