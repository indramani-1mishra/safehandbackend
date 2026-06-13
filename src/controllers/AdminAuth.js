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
    maxHttpOnly: false,  // Allow access in non-secure contexts during development
});

const AdminLogin = async (req, res) => {
    try {
        console.log("[AUTH LOGIN] Request received", {
            phone: req.body?.phone ? req.body.phone.slice(-4) : 'unknown',  // Log last 4 digits only
            hasOtp: !!req.body?.otp,
            timestamp: new Date().toISOString()
        });

        // If OTP provided -> verify and login
        if (req.body && req.body.phone && req.body.otp) {
            const { accessToken, refreshToken } = await AdminLoginService.verifyOtp(req.body.phone, req.body.otp);
            const options = getCookieOptions();

            res.cookie("refreshToken", refreshToken, {
                ...options,
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            res.cookie("adminToken", accessToken, {
                ...options,
                maxAge: 45 * 60 * 1000 // 45 minutes
            });

            res.cookie("adminLoggedIn", "true", {
                secure: options.secure,
                sameSite: options.sameSite,
                path: options.path,
                maxAge: 45 * 60 * 1000 // 45 minutes (matches adminToken)
            });

            console.log("[AUTH LOGIN] OTP verification successful", {
                phone: req.body.phone.slice(-4),
                tokenExpiryAccess: new Date(Date.now() + 45 * 60 * 1000),
                tokenExpiryRefresh: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                timestamp: new Date().toISOString()
            });

            return res.status(200).json({
                success: true,
                message: "Admin logged in successfully"
            });
        }

        // Otherwise treat as OTP request (phone only)
        if (req.body && req.body.phone) {
            const result = await AdminLoginService.requestforOtp(req.body.phone);
            console.log("[AUTH LOGIN] OTP request sent", {
                phone: req.body.phone.slice(-4),
                timestamp: new Date().toISOString()
            });
            return res.status(200).json(result);
        }

        throw new Error('Phone number is required');

    } catch (error) {
        console.log("[AUTH LOGIN] Error", {
            error: error.message,
            phone: req.body?.phone?.slice(-4),
            timestamp: new Date().toISOString()
        });
        res.status(401).json({
            success: false,
            message: error.message || error
        });
    }
};

const AdminRefreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        // ✅ Add logging to diagnose auto-logout
        console.log("[TOKEN REFRESH] Request received", {
            hasRefreshToken: !!refreshToken,
            timestamp: new Date().toISOString(),
            method: req.method,
            path: req.path
        });

        if (!refreshToken) {
            console.warn("[TOKEN REFRESH] No refreshToken in cookies", {
                allCookies: req.cookies,
                timestamp: new Date().toISOString()
            });
        }

        const { accessToken, refreshToken: newRefreshToken } = await AdminLoginService.AdminRefreshToken(refreshToken);
        const options = getCookieOptions();

        res.cookie("refreshToken", newRefreshToken, {
            ...options,
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.cookie("adminToken", accessToken, {
            ...options,
            maxAge: 45 * 60 * 1000 // 45 minutes
        });

        res.cookie("adminLoggedIn", "true", {
            secure: options.secure,
            sameSite: options.sameSite,
            path: options.path,
            maxAge: 45 * 60 * 1000 // 45 minutes
        });

        console.log("[TOKEN REFRESH] Success", {
            timestamp: new Date().toISOString(),
            newTokenExpiry: new Date(Date.now() + 45 * 60 * 1000)
        });

        res.status(200).json({
            success: true,
            message: "Access token refreshed successfully"
        });

    } catch (error) {
        console.error("[TOKEN REFRESH] Failed", {
            error: error.message,
            timestamp: new Date().toISOString()
        });
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
        res.clearCookie("adminLoggedIn", {
            secure: options.secure,
            sameSite: options.sameSite,
            path: options.path
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