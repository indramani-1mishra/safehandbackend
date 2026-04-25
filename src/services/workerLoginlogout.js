//const { sendOtp, verifyOtp } = require("../utils/senotp");
const workerRepository = require("../repository/workerRepository");
const { JWT_SECRET, REFRESH_SECRET } = require("../config/serverConfig");
const { generateSecureOtp, hashOtp, verifyOtp } = require("../utils/jenratesixdigitOtp");
const sendOtpThroughWhatsapp = require("../utils/sendOtpThroughWhatsapp");
const jwt = require("jsonwebtoken");
const sendOtpService = async (phone) => {
    try {
        const worker = await workerRepository.findWorkerByPhone(phone);
        if (!worker) {
            throw new Error("Worker not found");
        }
        const otp = generateSecureOtp();
        await sendOtpThroughWhatsapp(phone, otp);
        //console.log("OTP sent successfully");
        const hashedOtp = await hashOtp(otp);
        // console.log("Hashed OTP:", hashedOtp);
        await workerRepository.updateWorker(worker._id, { otp: hashedOtp, otpExpires: Date.now() + 1 * 60 * 1000 });
        console.log("OTP saved successfully");
    } catch (error) {
        throw error;
    }
}

const verifyOtpService = async (phone, otp, fcmToken) => {
    try {
        const worker = await workerRepository.findWorkerByPhone(phone);
        console.log("Worker:", worker);
        if (!worker) {
            throw new Error("Worker not found");
        }
        const workerOtp = worker.otp;
        console.log("Worker OTP:", workerOtp);
        console.log("User provided OTP:", otp);
        if (!workerOtp) {
            throw new Error("OTP not found");
        }
        const isOtpValid = await verifyOtp(otp, workerOtp);
        if (!isOtpValid) {
            throw new Error("Invalid OTP");
        }
        // check if otp is expired
        if (worker.otpExpires < Date.now()) {
            throw new Error("OTP expired");
        }
        await workerRepository.updateWorker(worker._id, {
            otp: null,
            otpExpires: null,
            isPhoneVerified: true,
            isOnline: true,
            fcmToken: fcmToken || "",

        });

        const accessToken = jwt.sign(
            { id: worker._id, role: worker.role || "worker" },
            JWT_SECRET,
            { expiresIn: "15m" }
        );

        //  Refresh Token (long life)
        const refreshToken = jwt.sign(
            { id: worker._id },
            REFRESH_SECRET,
            { expiresIn: "7d" }
        );

        // 👉 (Optional but recommended) save refresh token in DB
        await workerRepository.saveRefreshToken(worker._id, refreshToken);

        return {
            worker: {
                _id: worker._id,
                email: worker.email,

            },
            accessToken,
            refreshToken
        };
    } catch (error) {
        throw error;
    }
}

const resendOtpService = async (phone) => {
    try {
        const worker = await workerRepository.findWorkerByPhone(phone);
        if (!worker) {
            throw new Error("Worker not found");
        }
        await sendOtpService(phone);
    } catch (error) {
        throw error;
    }
}


const logoutService = async (id) => {
    try {
        const worker = await workerRepository.findWorkerById(id);
        if (!worker) {
            throw new Error("Worker not found");
        }
        await workerRepository.removeRefreshToken(id);
        await workerRepository.updateWorker(worker._id, { isOnline: false, fcmToken: "" });
    } catch (error) {
        throw error;
    }
}

const refreshTokenService = async (refreshToken) => {
    try {
        if (!refreshToken) {
            throw new Error("Refresh token required");
        }

        // Verify the token signature and expiry
        const decoded = jwt.verify(refreshToken, REFRESH_SECRET);

        const worker = await workerRepository.findWorkerByRefreshToken(refreshToken);
        if (!worker || worker._id.toString() !== decoded.id) {
            throw new Error("Invalid or expired refresh token");
        }

        const accessToken = jwt.sign(
            { id: worker._id, role: worker.role || "worker" }, // Added role, default to 'worker' if missing
            JWT_SECRET,
            { expiresIn: "15m" }
        );

        const newRefreshToken = jwt.sign(
            { id: worker._id },
            REFRESH_SECRET,
            { expiresIn: "7d" }
        );

        await workerRepository.saveRefreshToken(worker._id, newRefreshToken);
        await workerRepository.updateWorker(worker._id, { isOnline: true });

        return {
            worker: {
                _id: worker._id,
                email: worker.email,
            },
            accessToken,
            refreshToken: newRefreshToken
        };
    } catch (error) {
        throw new Error(error.message || "Invalid refresh token");
    }
}

module.exports = {
    sendOtpService,
    verifyOtpService,
    resendOtpService,
    logoutService,
    refreshTokenService

}