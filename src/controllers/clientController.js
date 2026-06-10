const clientService = require("../services/clientservice");
const { NODE_ENV } = require("../config/serverConfig");

const isProduction = NODE_ENV === "production";

const getCookieOptions = (maxAge) => ({
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "strict",
    maxAge
});

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

        res.cookie("clientAccessToken", accessToken, getCookieOptions(15 * 60 * 1000));
        res.cookie("clientRefreshToken", refreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000));

        res.status(200).json({
            success: true,
            message: "Authentication successful",
            data: client
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

const completeRegistrationController = async (req, res) => {
    try {
        const clientId = req.user.id;
        const { email, name } = req.body;
        let image = null;

        if (req.file) {
            image = req.file.location || req.file.path;
        }

        const client = await clientService.completeRegistrationService(clientId, { email, name, image });

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: client
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

const resendOtpController = async (req, res) => {
    try {
        const { phone } = req.body;
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
            const { REFRESH_SECRET } = require("../config/serverConfig");
            try {
                const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
                await clientService.logoutService(decoded.id);
            } catch (err) { }
        }

        const options = { ...getCookieOptions(0), path: "/" };
        res.clearCookie("clientAccessToken", options);
        res.clearCookie("clientRefreshToken", options);

        res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const refreshTokenController = async (req, res) => {
    try {
        const oldRefreshToken = req.cookies.clientRefreshToken;
        if (!oldRefreshToken) {
            throw new Error("Refresh token missing");
        }

        const { accessToken, refreshToken } = await clientService.refreshTokenService(oldRefreshToken);

        res.cookie("clientAccessToken", accessToken, getCookieOptions(15 * 60 * 1000));
        res.cookie("clientRefreshToken", refreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000));

        res.status(200).json({ success: true, message: "Token refreshed" });
    } catch (error) {
        res.status(401).json({ success: false, message: error.message });
    }
}

const getAllClientsController = async (req, res) => {
    try {
        const clients = await clientService.getAllClients();
        res.status(200).json({ success: true, data: clients });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const getClientByIdController = async (req, res) => {
    try {
        const client = await clientService.getClientById(req.params.id);
        res.status(200).json({ success: true, data: client });
    } catch (error) {
        res.status(404).json({ success: false, message: error.message });
    }
}

const updateClientController = async (req, res) => {
    try {
        const data = { ...req.body };
        if (req.file) {
            data.image = req.file.location || req.file.path;
        }
        const client = await clientService.updateClient(req.params.id, data);
        res.status(200).json({ success: true, data: client });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

const deleteClientController = async (req, res) => {
    try {
        await clientService.deleteClient(req.params.id);
        res.status(200).json({ success: true, message: "Client deleted" });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

const getMyJobCardsController = async (req, res) => {
    try {
        const JobCard = require("../modals/jobcartModel");
        const ClientRepository = require("../repository/ClientRepository1");
        
        const client = await ClientRepository.getClientByIdRepository(req.user.id);
        if (!client) throw new Error("Client not found");

        const phone = client.phone;
        
        // Find job cards linked to this phone, hiding nurse costs and interested workers
        const jobCards = await JobCard.find({ "patientDetails.phone": phone })
            .select("-perDayNurseCost -nursePaymentCycleDays -workers.interested")
            .populate({
                path: "workers.assigned",
                select: "-phone -email -address -payoutDetails -pan -aadhar -certificates" // Hide sensitive worker data
            })
            .populate("serviceDetails.service", "name pic")
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: jobCards });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const getClientByPhoneController = async (req, res) => {
    try {
        const { phone } = req.query;
        if (!phone) {
            return res.status(400).json({ success: false, message: "Phone query parameter is required" });
        }
        const client = await clientService.getClientByPhone(phone);
        if (!client) {
            return res.status(404).json({ success: false, message: "Client not found" });
        }
        res.status(200).json({ success: true, data: client });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

module.exports = {
    sendOtpController,
    verifyOtpController,
    completeRegistrationController,
    resendOtpController,
    logoutController,
    refreshTokenController,
    getAllClientsController,
    getClientByIdController,
    updateClientController,
    deleteClientController,
    getMyJobCardsController,
    getClientByPhoneController
};