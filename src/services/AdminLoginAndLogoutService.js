const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const adminRepository = require("../repository/adminrepository");
const { JWT_SECRET, REFRESH_SECRET } = require("../config/serverConfig");

const AdminLogin = async (data) => {
    if (!data.email || !data.password) {
        throw new Error("Email and password are required");
    }

    const admin = await adminRepository.findAdminByEmail(data.email);

    if (!admin) {
        throw new Error("Admin not found");
    }

    if (!admin.password) {
        throw new Error("Password not set for this admin");
    }

    const isPasswordValid = await bcrypt.compare(
        data.password,
        admin.password
    );

    if (!isPasswordValid) {
        throw new Error("Invalid password");
    }

    // ✅ Access Token (short life)
    const accessToken = jwt.sign(
        { id: admin._id, role: admin.role },
        JWT_SECRET,
        { expiresIn: "15m" }
    );

    // ✅ Refresh Token (long life)
    const refreshToken = jwt.sign(
        { id: admin._id },
        REFRESH_SECRET,
        { expiresIn: "7d" }
    );

    // 👉 (Optional but recommended) save refresh token in DB
    await adminRepository.saveRefreshToken(admin._id, refreshToken);

    return {
        admin: {
            _id: admin._id,
            email: admin.email,
            role: admin.role
        },
        accessToken,
        refreshToken
    };

};

const AdminLogout = async (adminId, refreshToken) => {
    await adminRepository.removeRefreshToken(adminId, refreshToken);

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
        await adminRepository.removeRefreshToken(admin._id, refreshToken);
        await adminRepository.saveRefreshToken(admin._id, newRefreshToken);

        return { accessToken, refreshToken: newRefreshToken };
    } catch (error) {
        throw new Error("Invalid or expired refresh token");
    }
};

module.exports = {
    AdminLogin,
    AdminLogout,
    AdminRefreshToken
};