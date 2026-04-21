const ServiceCategory = require("../modals/ServiceCategory");

const createServiceCategoryRepository = async (data) => {
    return await ServiceCategory.create(data);
}

const getServiceCategoryByIdRepository = async (id) => {
    return await ServiceCategory.findById(id);
}

const getAllServiceCategoriesRepository = async () => {
    return await ServiceCategory.find();
}

const updateServiceCategoryRepository = async (id, data) => {
    return await ServiceCategory.findByIdAndUpdate(id, data, { new: true });
}

const deleteServiceCategoryRepository = async (id) => {
    return await ServiceCategory.findByIdAndDelete(id);
}

module.exports = {
    createServiceCategoryRepository,
    getServiceCategoryByIdRepository,
    getAllServiceCategoriesRepository,
    updateServiceCategoryRepository,
    deleteServiceCategoryRepository
}


