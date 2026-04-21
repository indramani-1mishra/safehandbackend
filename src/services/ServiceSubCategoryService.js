const serviceSubCategoryRepo = require("../repository/serviceSubCategoryRepo");

const createServiceSubCategoryService = async (data) => {
    if (!data.name || !data.image || !data.category) {
        throw new Error("SubCategory name, image, and category ID are required");
    }
    return await serviceSubCategoryRepo.createServiceSubCategoryRepository(data);
};

const getServiceSubCategoryByIdService = async (id) => {
    const subCategory = await serviceSubCategoryRepo.getServiceSubCategoryByIdRepository(id);
    if (!subCategory) throw new Error("SubCategory not found");
    return subCategory;
};

const getServiceSubCategoryByCategoryIdService = async (categoryId) => {
    return await serviceSubCategoryRepo.getServiceSubCategoryByCategoryIdRepository(categoryId);
};

const getAllServiceSubCategoriesService = async () => {
    return await serviceSubCategoryRepo.getAllServiceSubCategoriesRepository();
};

const updateServiceSubCategoryService = async (id, data) => {
    const subCategory = await serviceSubCategoryRepo.getServiceSubCategoryByIdRepository(id);
    if (!subCategory) throw new Error("SubCategory not found");

    return await serviceSubCategoryRepo.updateServiceSubCategoryRepository(id, data);
};

const deleteServiceSubCategoryService = async (id) => {
    const subCategory = await serviceSubCategoryRepo.getServiceSubCategoryByIdRepository(id);
    if (!subCategory) throw new Error("SubCategory not found");

    return await serviceSubCategoryRepo.deleteServiceSubCategoryRepository(id);
};

module.exports = {
    createServiceSubCategoryService,
    getServiceSubCategoryByIdService,
    getServiceSubCategoryByCategoryIdService,
    getAllServiceSubCategoriesService,
    updateServiceSubCategoryService,
    deleteServiceSubCategoryService
};
