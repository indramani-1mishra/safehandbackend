const productService = require("../services/productService");

const createProductController = async (req, res) => {
    try {
        const { subCategoryId, name, description, price, availableQuantity } = req.body;
        if (!subCategoryId || !name || !price) return res.status(400).json({ success: false, message: "subCategoryId, name, and price are required" });
        if (!req.file) return res.status(400).json({ success: false, message: "Image is required" });

        const image = req.file.location || req.file.path;
        const product = await productService.createProduct({ 
            subCategoryId, name, description, price, availableQuantity, image 
        });
        
        res.status(201).json({ success: true, message: "Product created", data: product });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const getAllProductsController = async (req, res) => {
    try {
        const products = await productService.getAllProducts();
        res.status(200).json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getProductsBySubCategoryController = async (req, res) => {
    try {
        const { subCategoryId } = req.params;
        const products = await productService.getProductsBySubCategory(subCategoryId);
        res.status(200).json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getProductByIdController = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await productService.getProductById(id);
        if (!product) return res.status(404).json({ success: false, message: "Product not found" });
        res.status(200).json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateProductController = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };
        if (req.file) {
            updateData.image = req.file.location || req.file.path;
        }

        const updatedProduct = await productService.updateProduct(id, updateData);
        if (!updatedProduct) return res.status(404).json({ success: false, message: "Product not found" });

        res.status(200).json({ success: true, message: "Product updated", data: updatedProduct });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const deleteProductController = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await productService.deleteProduct(id);
        if (!deleted) return res.status(404).json({ success: false, message: "Product not found" });

        res.status(200).json({ success: true, message: "Product deleted" });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = {
    createProductController,
    getAllProductsController,
    getProductsBySubCategoryController,
    getProductByIdController,
    updateProductController,
    deleteProductController
};
