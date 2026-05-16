const serviceCategoryRepository = require("../repository/ServiceCategoryrepository");

const createServiceCategoryService = async (data) => {
    if (!data.name || !data.image || !data.serviceType) {
        throw new Error("Category name, image, and serviceType are required");
    }
    return await serviceCategoryRepository.createServiceCategoryRepository(data);
};

const getServiceCategoryByIdService = async (id) => {
    const category = await serviceCategoryRepository.getServiceCategoryByIdRepository(id);
    if (!category) throw new Error("Category not found");
    return category;
};

const getAllServiceCategoriesService = async () => {
    return await serviceCategoryRepository.getAllServiceCategoriesRepository();
};

const updateServiceCategoryService = async (id, data) => {
    const category = await serviceCategoryRepository.getServiceCategoryByIdRepository(id);
    if (!category) throw new Error("Category not found");
    
    return await serviceCategoryRepository.updateServiceCategoryRepository(id, data);
};

const deleteServiceCategoryService = async (id) => {
    const category = await serviceCategoryRepository.getServiceCategoryByIdRepository(id);
    if (!category) throw new Error("Category not found");
    
    return await serviceCategoryRepository.deleteServiceCategoryRepository(id);
};

module.exports = {
    createServiceCategoryService,
    getServiceCategoryByIdService,
    getAllServiceCategoriesService,
    updateServiceCategoryService,
    deleteServiceCategoryService
};
