const AdminLoginService = require("../services/AdminLoginAndLogoutService");
const { NODE_ENV } = require("../config/serverConfig");
const AdminLogin = async (req, res) => {
    try {
        const admin = await AdminLoginService.AdminLogin(req.body);

        res.cookie("adminToken", admin.token, {
            httpOnly: true,
            secure: NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            success: true,
            data: {
                _id: admin._id,
                email: admin.email
            },
            message: "Admin logged in successfully"
        });

    } catch (error) {
        res.status(401).json({
            success: false,
            message: error.message
        });
    }
};

const AdminLogout = async (req, res) => {
    try {
        res.clearCookie("adminToken", {
            httpOnly: true,
            secure: NODE_ENV === "production",
            sameSite: "strict"
        });

        res.status(200).json({
            success: true,
            message: "Admin logged out successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    AdminLogin,
    AdminLogout
};