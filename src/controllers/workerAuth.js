const workerService = require("../services/workerLoginlogout");


const SendOtpController = async (req, res) => {
    try {
        const worker = await workerService.sendOtpService(req.body.phone);
        return res.status(200).json({
            success: true,
            data: worker
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

const VerifyOtpController = async (req, res) => {
    try {
        const { worker, accessToken, refreshToken } = await workerService.verifyOtpService(req.body.phone, req.body.otp);
        res.cookie("workerAccessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000
        });

        res.cookie("workerRefreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            success: true,
            data: worker,
            message: "Worker logged in successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

const ResendOtpController = async (req, res) => {
    try {
        const worker = await workerService.resendOtpService(req.body.phone);
        return res.status(200).json({
            success: true,
            data: worker
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

const LogoutController = async (req, res) => {
    try {
        const refreshToken = req.cookies.workerRefreshToken;
        
        if (refreshToken) {
            const jwt = require("jsonwebtoken");
            let decodedId = null;
            try {
                const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
                decodedId = decoded.id;
            } catch (err) {
                const decoded = jwt.decode(refreshToken);
                if (decoded) decodedId = decoded.id;
            }
            
            if (decodedId) {
                await workerService.logoutService(decodedId);
            }
        }
        res.clearCookie("workerAccessToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/"
        });
        res.clearCookie("workerRefreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/"
        });
        
        return res.status(200).json({
            success: true,
            message: "Worker logged out successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

const RefreshTokenController = async (req, res) => {
    try {
        const tokenFromCookie = req.cookies.workerRefreshToken;
        
        if (!tokenFromCookie) {
            return res.status(401).json({ success: false, message: "No refresh token provided" });
        }
        
        const { worker, accessToken, refreshToken } = await workerService.refreshTokenService(tokenFromCookie);
        res.cookie("workerAccessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000
        });

        res.cookie("workerRefreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            success: true,
            data: worker,
            message: "Worker logged in successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}



module.exports = {
    SendOtpController,
    VerifyOtpController,
    ResendOtpController,
    LogoutController,
    RefreshTokenController
}
