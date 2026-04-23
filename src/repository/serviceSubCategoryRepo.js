const ServiceSubCategory = require("../modals/ServiceSubCategoryModal");

const createServiceSubCategoryRepository = async (data) => {
    return await ServiceSubCategory.create(data);
}

const getServiceSubCategoryByIdRepository = async (id) => {
    return await ServiceSubCategory.findById(id).populate("category", "name");
}

const getServiceSubCategoryByCategoryIdRepository = async (categoryId) => {
    return await ServiceSubCategory.find({ category: categoryId }).populate("category", "name");
}

const getAllServiceSubCategoriesRepository = async () => {
    return await ServiceSubCategory.find().populate("category", "name");
}

const updateServiceSubCategoryRepository = async (id, data) => {
    return await ServiceSubCategory.findByIdAndUpdate(id, data, { returnDocument: "after", }).populate("category", "name");
}

const deleteServiceSubCategoryRepository = async (id) => {
    return await ServiceSubCategory.findByIdAndDelete(id);
}

module.exports = {
    createServiceSubCategoryRepository,
    getServiceSubCategoryByIdRepository,
    getAllServiceSubCategoriesRepository,
    updateServiceSubCategoryRepository,
    deleteServiceSubCategoryRepository,
    getServiceSubCategoryByCategoryIdRepository
}