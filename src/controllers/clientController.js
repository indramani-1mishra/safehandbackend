const clientService = require("../services/clientservice");

const sendOtpRegistrationController = async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone) {
            throw new Error("Phone number is required");
        }
        const result = await clientService.sendOtpRegistrationService(phone);
        res.status(200).json({ success: true, message: result.message });
    } catch (error) {
        const statusCode = error.message.includes("exists") ? 409 : 400;
        res.status(statusCode).json({ success: false, message: error.message });
    }
}

const verifyOtpRegistrationController = async (req, res) => {
    try {
        const { phone, otp } = req.body;
        if (!phone || !otp) {
            throw new Error("Phone and OTP are required");
        }
        const result = await clientService.verifyOtpRegistrationService(phone, otp);
        const { client, accessToken, refreshToken } = result;

        res.cookie("clientAccessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 15 * 60 * 1000 
        });

        res.cookie("clientRefreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000 
        });

        res.status(200).json({ 
            success: true, 
            message: "Phone verified successfully. You are now logged in. Please complete your profile.", 
            data: client 
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

const completeRegistrationController = async (req, res) => {
    try {
        const { email, name } = req.body;
        const clientId = req.user.id; // From authMiddleware

        if (req.file) {
            req.body.image = req.file.location;
        }
        if (!email || !name) {
            throw new Error("email and name are required");
        }

        const client = await clientService.completeRegistrationService(clientId, req.body);

        res.status(200).json({ 
            success: true, 
            message: "Profile completed successfully", 
            data: client 
        });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

const sendOtpController = async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone) {
            throw new Error("Phone number is required");
        }
        const result = await clientService.sendOtpService(phone);
        res.status(200).json({ success: true, message: result.message });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

const verifyOtpController = async (req, res) => {
    try {
        const { phone, otp } = req.body;
        if (!phone || !otp) {
            throw new Error("Phone and OTP are required");
        }

        const result = await clientService.verifyOtpService(phone, otp);
        const { client, accessToken, refreshToken } = result;

        res.cookie("clientAccessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 15 * 60 * 1000 
        });

        res.cookie("clientRefreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000 
        });

        res.status(200).json({ 
            success: true, 
            message: "Login successful", 
            data: client 
        });
    } catch (error) {
        res.status(401).json({ success: false, message: error.message });
    }
}

const resendOtpController = async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone) {
            throw new Error("Phone number is required");
        }
        const result = await clientService.resendOtpService(phone);
        res.status(200).json({ success: true, message: result.message });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

const logoutController = async (req, res) => {
    try {
        const refreshToken = req.cookies.clientRefreshToken;
        if (refreshToken) {
            const jwt = require("jsonwebtoken");
            try {
                const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
                await clientService.logoutService(decoded.id);
            } catch (err) {}
        }

        res.clearCookie("clientAccessToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/"
        });
        res.clearCookie("clientRefreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/"
        });

        res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const refreshTokenController = async (req, res) => {
    try {
        const tokenFromCookie = req.cookies.clientRefreshToken;
        if (!tokenFromCookie) {
            return res.status(401).json({ success: false, message: "No refresh token provided" });
        }

        const result = await clientService.refreshTokenService(tokenFromCookie);
        const { client, accessToken, refreshToken } = result;

        res.cookie("clientAccessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 15 * 60 * 1000 
        });

        res.cookie("clientRefreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000 
        });

        res.status(200).json({ success: true, data: client });
    } catch (error) {
        res.status(401).json({ success: false, message: error.message });
    }
}

const updateClientController = async (req, res) => {
    try {
        if (req.file) {
            req.body.image = req.file.location;
        }
        const client = await clientService.updateClientService(req.params.id, req.body);
        res.status(200).json({ success: true, message: "Client updated successfully", data: client });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

const deleteClientController = async (req, res) => {
    try {
        const client = await clientService.deleteClientService(req.params.id);
        res.status(200).json({ success: true, message: "Client deleted successfully", data: client });
    } catch (error) {
        res.status(404).json({ success: false, message: error.message });
    }
}

const getClientByIdController = async (req, res) => {
    try {
        const client = await clientService.getClientByIdService(req.params.id);
        res.status(200).json({ success: true, data: client });
    } catch (error) {
        res.status(404).json({ success: false, message: error.message });
    }
}

const getAllClientsController = async (req, res) => {
    try {
        const clients = await clientService.getAllClientsService();
        res.status(200).json({ success: true, data: clients });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

module.exports = {
    sendOtpRegistrationController,
    verifyOtpRegistrationController,
    completeRegistrationController,
    sendOtpController,
    verifyOtpController,
    resendOtpController,
    logoutController,
    refreshTokenController,
    updateClientController,
    deleteClientController,
    getClientByIdController,
    getAllClientsController
}