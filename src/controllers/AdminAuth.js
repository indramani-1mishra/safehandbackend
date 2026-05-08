const AdminLoginService = require("../services/AdminLoginAndLogoutService");
const { NODE_ENV, REFRESH_SECRET } = require("../config/serverConfig");
const jwt = require("jsonwebtoken");

// Use the imported NODE_ENV to ensure it's correctly loaded from config
const isProduction = NODE_ENV === "production";

const getCookieOptions = () => ({
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
});

const AdminLogin = async (req, res) => {
    try {
        console.log("AdminLogin", req.body);
        const { admin, accessToken, refreshToken } = await AdminLoginService.AdminLogin(req.body);
        const options = getCookieOptions();

        res.cookie("refreshToken", refreshToken, {
            ...options,
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.cookie("adminToken", accessToken, {
            ...options,
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
        console.log("AdminLogin Error", error);
        res.status(401).json({
            success: false,
            message: error.message || error
        });
    }
};

const AdminRefreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        const { accessToken, refreshToken: newRefreshToken } = await AdminLoginService.AdminRefreshToken(refreshToken);
        const options = getCookieOptions();

        res.cookie("refreshToken", newRefreshToken, {
            ...options,
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.cookie("adminToken", accessToken, {
            ...options,
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
        const options = getCookieOptions();

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

        res.clearCookie("refreshToken", { ...options });
        res.clearCookie("adminToken", { ...options });

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