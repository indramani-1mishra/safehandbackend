const jwt = require("jsonwebtoken");
const ClientRepository = require("../repository/ClientRepository1");
const { JWT_SECRET, REFRESH_SECRET } = require("../config/serverConfig");
const cartRepository = require("../repository/cartrepository");
const { generateSecureOtp, hashOtp, verifyOtp } = require("../utils/jenratesixdigitOtp");
const sendOtpThroughWhatsapp = require("../utils/sendOtpThroughWhatsapp");

const generateTokens = (client) => {
    const accessToken = jwt.sign(
        { id: client._id, role: "client" },
        JWT_SECRET,
        { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
        { id: client._id },
        REFRESH_SECRET,
        { expiresIn: "7d" }
    );

    return { accessToken, refreshToken };
};

/**
 * 🔥 UNIVERSAL AUTH FLOW (Login/Register)
 * If user doesn't exist, it creates one.
 * Sends OTP to phone number.
 */
const sendOtpService = async (phone) => {
    try {
        let client = await ClientRepository.findClientByPhoneRepository(phone);
        if (!client) {
            client = await ClientRepository.createClientRepository({ phone });
        }

        const otp = generateSecureOtp();
        await sendOtpThroughWhatsapp(phone, otp);
        const hashedOtp = await hashOtp(otp);
        await ClientRepository.updateClientRepository(client._id, {
            otp: hashedOtp,
            otpExpires: Date.now() + 5 * 60 * 1000 // 5 minutes
        });
        return { message: "OTP sent successfully" };
    } catch (error) {
        throw error;
    }
}

/**
 * 🔥 VERIFY OTP (Universal)
 * Verifies OTP and returns Tokens.
 */
const verifyOtpService = async (phone, otp) => {
    try {
        const client = await ClientRepository.findClientByPhoneRepository(phone);
        if (!client) {
            throw new Error("Client not found");
        }

        // Master OTP for testing
        if (client.phone === "0000000000" && otp === "123456") {
            await ClientRepository.updateClientRepository(client._id, {
                otp: null,
                otpExpires: null,
                isPhoneVerified: true
            });
            const { accessToken, refreshToken } = generateTokens(client);
            await ClientRepository.saveRefreshToken(client._id, refreshToken);
            return { client, accessToken, refreshToken };
        }

        if (client.otpExpires < Date.now()) {
            throw new Error("OTP expired");
        }

        const isOtpValid = await verifyOtp(otp, client.otp);
        if (!isOtpValid) {
            throw new Error("Invalid OTP");
        }

        await ClientRepository.updateClientRepository(client._id, {
            otp: null,
            otpExpires: null,
            isPhoneVerified: true
        });

        const { accessToken, refreshToken } = generateTokens(client);
        await ClientRepository.saveRefreshToken(client._id, refreshToken);

        return { client, accessToken, refreshToken };
    } catch (error) {
        throw error;
    }
}

/**
 * 🔥 COMPLETE PROFILE (Registration Step 2)
 * After verification, user provides name/email.
 */
const completeRegistrationService = async (clientId, data) => {
    const { email, name, image } = data;
    if (!email || !name) {
        throw new Error("email and name are required");
    }

    const client = await ClientRepository.getClientByIdRepository(clientId);
    if (!client) {
        throw new Error("Client record not found.");
    }

    if (!client.isPhoneVerified) {
        throw new Error("Phone not verified. Please verify phone first.");
    }

    const existingEmailClient = await ClientRepository.findClientByEmailRepository(email);
    if (existingEmailClient && existingEmailClient._id.toString() !== client._id.toString()) {
        throw new Error("Account already exists with this email");
    }

    const updatedClient = await ClientRepository.updateClientRepository(client._id, {
        email,
        name,
        image: image || client.image
    });

    await cartRepository.createCart({ userId: updatedClient._id });

    return updatedClient;
}

const resendOtpService = async (phone) => {
    try {
        return await sendOtpService(phone);
    } catch (error) {
        throw error;
    }
}

const logoutService = async (id) => {
    try {
        await ClientRepository.removeRefreshToken(id);
    } catch (error) {
        throw error;
    }
}

const refreshTokenService = async (oldRefreshToken) => {
    try {
        const decoded = jwt.verify(oldRefreshToken, REFRESH_SECRET);
        const client = await ClientRepository.findClientByRefreshToken(oldRefreshToken);

        if (!client || client._id.toString() !== decoded.id) {
            throw new Error("Invalid refresh token");
        }

        const tokens = generateTokens(client);
        await ClientRepository.saveRefreshToken(client._id, tokens.refreshToken);
        return tokens;
    } catch (error) {
        throw new Error("Refresh token expired or invalid");
    }
}

const getAllClients = async () => {
    return await ClientRepository.getAllClientsRepository();
}

const getClientById = async (id) => {
    return await ClientRepository.getClientByIdRepository(id);
}

const updateClient = async (id, data) => {
    return await ClientRepository.updateClientRepository(id, data);
}

const deleteClient = async (id) => {
    return await ClientRepository.deleteClientRepository(id);
}

module.exports = {
    sendOtpService,
    verifyOtpService,
    completeRegistrationService,
    resendOtpService,
    logoutService,
    refreshTokenService,
    getAllClients,
    getClientById,
    updateClient,
    deleteClient
};
