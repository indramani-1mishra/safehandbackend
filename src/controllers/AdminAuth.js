const AdminLoginService = require("../services/AdminLoginAndLogoutService");
const { NODE_ENV, REFRESH_SECRET } = require("../config/serverConfig");
const jwt = require("jsonwebtoken");

const AdminLogin = async (req, res) => {
    try {
        const { admin, accessToken, refreshToken } = await AdminLoginService.AdminLogin(req.body);

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.cookie("adminToken", accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            path: "/",
            maxAge: 15 * 60 * 1000 // 15 minutes
        });

        res.status(200).json({
            success: true,
            data: {
                _id: admin._id,
                email: admin.email,
                role: admin.role
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

const AdminRefreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        const { accessToken, refreshToken: newRefreshToken } = await AdminLoginService.AdminRefreshToken(refreshToken);

        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.cookie("adminToken", accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            path: "/",
            maxAge: 15 * 60 * 1000 // 15 minutes
        });

        res.status(200).json({
            success: true,
            message: "Access token refreshed successfully"
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
        const refreshToken = req.cookies.refreshToken;

        if (refreshToken) {
            let decodedId = null;
            try {
                const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
                decodedId = decoded.id;
            } catch (err) {
                const decoded = jwt.decode(refreshToken);
                if (decoded) decodedId = decoded.id;
            }

            if (decodedId) {
                await AdminLoginService.AdminLogout(decodedId);
            }
        }

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            path: "/"
        });

        res.clearCookie("adminToken", {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            path: "/"
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
    AdminLogout,
    AdminRefreshToken
};