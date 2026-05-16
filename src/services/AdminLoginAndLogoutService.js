const jwt = require("jsonwebtoken");
const adminRepository = require("../repository/adminrepository");
const { JWT_SECRET, REFRESH_SECRET } = require("../config/serverConfig");
const { generateSecureOtp, hashOtp: hashOtpUtil, verifyOtp: verifyOtpUtil } = require("../utils/jenratesixdigitOtp");
const sendOtpThroughWhatsapp = require("../utils/sendOtpThroughWhatsapp");



const AdminLogout = async (adminId) => {
  const admin = await adminRepository.findAdminById(adminId);
  if (!admin) {
    throw new Error("Admin not found");
  }
    return {
        success: true,
        message: "Logged out successfully"
    };
};

const AdminRefreshToken = async (refreshToken) => {
    if (!refreshToken) {
        throw new Error("Refresh token required");
    }

    try {
        const decoded = jwt.verify(refreshToken, REFRESH_SECRET);

        const admin = await adminRepository.findAdminByRefreshToken(refreshToken);
        if (!admin || admin._id.toString() !== decoded.id) {
            throw new Error("Invalid refresh token");
        }

        const accessToken = jwt.sign(
            { id: admin._id, role: admin.role },
            JWT_SECRET,
            { expiresIn: "15m" }
        );

        const newRefreshToken = jwt.sign(
            { id: admin._id },
            REFRESH_SECRET,
            { expiresIn: "7d" }
        );
        await adminRepository.removeRefreshToken(admin._id);
        await adminRepository.saveRefreshToken(admin._id, newRefreshToken);

        return { accessToken, refreshToken: newRefreshToken };
    } catch (error) {
        throw new Error("Invalid or expired refresh token");
    }
};

const requestforOtp = async (phone) => {
    if (!phone) {
        throw new Error("Phone number is required");
    }
    
    const admin = await adminRepository.findAdminByPhone(phone);
    if (!admin) {
        throw new Error("Admin not found");
    }
    
    // Check account status
    if (admin.accountStatus === "pending") {
        throw new Error("Admin account is pending approval");
    }
    
    if (admin.accountStatus === "deactivated") {
        throw new Error("Admin account is deactivated");
    }
    
    // Check if account is locked (brute force protection)
    if (admin.lockUntil && new Date() < admin.lockUntil) {
        const minutesLeft = Math.ceil((admin.lockUntil - new Date()) / 60000);
        throw new Error(`Account locked. Try again in ${minutesLeft} minutes`);
    }
    
    // Rate limiting: Min 2 minutes between OTP requests
    if (admin.lastOtpSentAt) {
        const timeSinceLastOtp = new Date() - admin.lastOtpSentAt;
        const OTP_COOLDOWN = 2 * 60 * 1000; // 2 minutes
        
        if (timeSinceLastOtp < OTP_COOLDOWN) {
            const secondsLeft = Math.ceil((OTP_COOLDOWN - timeSinceLastOtp) / 1000);
            throw new Error(`Please wait ${secondsLeft} seconds before requesting a new OTP`);
        }
    }
    
    const otp = generateSecureOtp();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    const hashedOtp = await hashOtpUtil(otp);
    
    try {
        await sendOtpThroughWhatsapp(phone, otp);
    } catch (error) {
        throw new Error(`Failed to send OTP: ${error.message}`);
    }
    
    await adminRepository.updateAdmin(admin._id, { 
        otp: hashedOtp, 
        otpExpires,
        lastOtpSentAt: new Date()
    });
    
    return {
        success: true,
        message: "OTP sent successfully",
        admin: {
            name: admin.name,
            role: admin.role,
            image: admin.image || null,
            accountStatus: admin.accountStatus
        }
    };
};

const verifyOtp = async (phone, otp) => {
    if (!phone || !otp) {
        throw new Error("Phone number and OTP are required");
    }

    const admin = await adminRepository.findAdminByPhone(phone, true);
    if (!admin) {
        throw new Error("Admin not found");
    }

    // Check account status
    if (admin.accountStatus !== 'active') {
        throw new Error('Admin account is not approved. Contact administrator.');
    }

    // Check if account is locked
    if (admin.lockUntil && new Date() < admin.lockUntil) {
        const minutesLeft = Math.ceil((admin.lockUntil - new Date()) / 60000);
        throw new Error(`Account locked due to failed attempts. Try again in ${minutesLeft} minutes`);
    }

    // Verify OTP hash
    const isOtpValid = await verifyOtpUtil(otp, admin.otp);
    
    if (!isOtpValid) {
        // Increment failed attempts
        const newAttempts = (admin.loginAttempts || 0) + 1;
        const MAX_ATTEMPTS = 5;
        
        if (newAttempts >= MAX_ATTEMPTS) {
            // Lock account for 30 minutes
            const lockUntil = new Date(Date.now() + 30 * 60 * 1000);
            await adminRepository.updateAdmin(admin._id, {
                loginAttempts: newAttempts,
                lockUntil
            });
            throw new Error(`Too many failed attempts. Account locked for 30 minutes.`);
        } else {
            // Update attempts
            await adminRepository.updateAdmin(admin._id, {
                loginAttempts: newAttempts
            });
            const attemptsLeft = MAX_ATTEMPTS - newAttempts;
            throw new Error(`Invalid OTP. ${attemptsLeft} attempts remaining.`);
        }
    }

    // Check OTP expiry
    if (new Date() > admin.otpExpires) {
        throw new Error("OTP has expired");
    }

    // Clear OTP fields and reset login attempts on successful verification
    await adminRepository.updateAdmin(admin._id, {
        otp: null,
        otpExpires: null,
        lastLogin: new Date(),
        loginAttempts: 0,        // Reset attempts on success
        lockUntil: null          // Clear lock
    });

    // Generate access token after successful OTP verification
    const accessToken = jwt.sign(
        { id: admin._id, role: admin.role, name: admin.name },
        JWT_SECRET,
        { expiresIn: "45m" }
    );
    
    const refreshToken = jwt.sign(
        { id: admin._id },
        REFRESH_SECRET,
        { expiresIn: "7d" }
    );
    
    await adminRepository.saveRefreshToken(admin._id, refreshToken);
    
    return {
        accessToken,
        refreshToken
    };
};

module.exports = {
    AdminLogout,
    AdminRefreshToken,
    requestforOtp,
    verifyOtp
};