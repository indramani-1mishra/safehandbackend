const EquipmentCategory = require("../modals/EquipmentCategory");

const createEquipmentCategoryService = async (categoryData) => {
    return await EquipmentCategory.create(categoryData);
};

const updateEquipmentCategoryService = async (id, updateData) => {
    return await EquipmentCategory.findByIdAndUpdate(id, updateData, { new: true });
};

const deleteEquipmentCategoryService = async (id) => {
    return await EquipmentCategory.findByIdAndDelete(id);
};

const getAllEquipmentCategoriesService = async () => {
    return await EquipmentCategory.find({});
};

module.exports = {
    createEquipmentCategoryService,
    updateEquipmentCategoryService,
    deleteEquipmentCategoryService,
    getAllEquipmentCategoriesService
};
