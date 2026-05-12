const upload = require("../middleware/multer");
const equipmentService = require("../services/equipmentService");

const uploadImages = upload.fields([
    { name: "pic", maxCount: 1 }
]);

const createEquipmentController = async (req, res) => {
    try {
        const equipmentData = { ...req.body };
        
        // Parse keys if it's sent as a stringified array from FormData
        if (equipmentData.keys && typeof equipmentData.keys === 'string') {
            try {
                equipmentData.keys = JSON.parse(equipmentData.keys);
            } catch (e) {
                // If it's a single string instead of stringified array, wrap it in array
                equipmentData.keys = [equipmentData.keys];
            }
        }

        if (req.files && req.files.pic) {
            equipmentData.pic = req.files.pic[0].location;
        }

        const newEquipment = await equipmentService.createEquipmentService(equipmentData);
        return res.status(201).json({
            success: true,
            message: "Equipment created successfully",
            data: newEquipment
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const updateEquipmentController = async (req, res) => {
    try {
        const { id } = req.params;
        const equipmentData = { ...req.body };

        if (equipmentData.keys && typeof equipmentData.keys === 'string') {
            try {
                equipmentData.keys = JSON.parse(equipmentData.keys);
            } catch (e) {
                equipmentData.keys = [equipmentData.keys];
            }
        }

        if (req.files && req.files.pic) {
            equipmentData.pic = req.files.pic[0].location;
        }

        const updatedEquipment = await equipmentService.updateEquipmentService(id, equipmentData);
        return res.status(200).json({
            success: true,
            message: "Equipment updated successfully",
            data: updatedEquipment
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const deleteEquipmentController = async (req, res) => {
    try {
        const { id } = req.params;
        await equipmentService.deleteEquipmentService(id);
        return res.status(200).json({
            success: true,
            message: "Equipment deleted successfully"
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const getAllEquipmentsController = async (req, res) => {
    try {
        const equipments = await equipmentService.getAllEquipmentsService();
        return res.status(200).json({
            success: true,
            data: equipments
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const getEquipmentByIdController = async (req, res) => {
    try {
        const { id } = req.params;
        const equipment = await equipmentService.getEquipmentByIdService(id);
        return res.status(200).json({
            success: true,
            data: equipment
        });
    } catch (error) {
        return res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

const getEquipmentsByCategoryController = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const equipments = await equipmentService.getEquipmentsByCategoryService(categoryId);
        return res.status(200).json({
            success: true,
            data: equipments
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    uploadImages,
    createEquipmentController,
    updateEquipmentController,
    deleteEquipmentController,
    getAllEquipmentsController,
    getEquipmentByIdController,
    getEquipmentsByCategoryController
};
