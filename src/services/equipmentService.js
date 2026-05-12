const Equipment = require("../modals/Equipment");

const createEquipmentService = async (equipmentData) => {
    return await Equipment.create(equipmentData);
};

const updateEquipmentService = async (id, updateData) => {
    return await Equipment.findByIdAndUpdate(id, updateData, { new: true });
};

const deleteEquipmentService = async (id) => {
    return await Equipment.findByIdAndDelete(id);
};

const getAllEquipmentsService = async () => {
    return await Equipment.find({}).populate("categoryId");
};

const getEquipmentByIdService = async (id) => {
    const equipment = await Equipment.findById(id).populate("categoryId");
    if (!equipment) {
        throw new Error("Equipment not found");
    }
    return equipment;
};

const getEquipmentsByCategoryService = async (categoryId) => {
    return await Equipment.find({ categoryId }).populate("categoryId");
};

module.exports = {
    createEquipmentService,
    updateEquipmentService,
    deleteEquipmentService,
    getAllEquipmentsService,
    getEquipmentByIdService,
    getEquipmentsByCategoryService
};
