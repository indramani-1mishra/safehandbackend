const checkoutService = require("../services/checkoutService");

const processCheckoutController = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;

        const { shippingAddress, city, contactNumber } = req.body;
        if (!shippingAddress || !city || !contactNumber) {
            return res.status(400).json({
                success: false,
                message: "shippingAddress, city, and contactNumber are required for checkout"
            });
        }

        const result = await checkoutService.processCheckoutService(userId, req.body);

        return res.status(201).json({
            success: true,
            message: "Unified Checkout processed successfully",
            data: result
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    processCheckoutController
};
