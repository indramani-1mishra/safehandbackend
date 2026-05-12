const upload = require("../middleware/multer");
const equipmentCategoryService = require("../services/equipmentCategoryService");

const uploadImages = upload.fields([
    { name: "image", maxCount: 1 }
]);

const createEquipmentCategoryController = async (req, res) => {
    try {
        const categoryData = { ...req.body };
        if (req.files && req.files.image) {
            categoryData.image = req.files.image[0].location;
        }

        const newCategory = await equipmentCategoryService.createEquipmentCategoryService(categoryData);
        return res.status(201).json({
            success: true,
            message: "Equipment Category created successfully",
            data: newCategory
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const updateEquipmentCategoryController = async (req, res) => {
    try {
        const { id } = req.params;
        const categoryData = { ...req.body };

        if (req.files && req.files.image) {
            categoryData.image = req.files.image[0].location;
        }

        const updatedCategory = await equipmentCategoryService.updateEquipmentCategoryService(id, categoryData);
        return res.status(200).json({
            success: true,
            message: "Equipment Category updated successfully",
            data: updatedCategory
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const deleteEquipmentCategoryController = async (req, res) => {
    try {
        const { id } = req.params;
        await equipmentCategoryService.deleteEquipmentCategoryService(id);
        return res.status(200).json({
            success: true,
            message: "Equipment Category deleted successfully"
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const getAllEquipmentCategoriesController = async (req, res) => {
    try {
        const categories = await equipmentCategoryService.getAllEquipmentCategoriesService();
        return res.status(200).json({
            success: true,
            data: categories
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
    createEquipmentCategoryController,
    updateEquipmentCategoryController,
    deleteEquipmentCategoryController,
    getAllEquipmentCategoriesController
};
