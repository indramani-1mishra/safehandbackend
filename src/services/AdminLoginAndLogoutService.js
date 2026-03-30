const adminRepository = require("../repository/adminrepository");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/serverConfig");

const AdminLogin = async (data) => {
    if (!data.email || !data.password) {
        throw new Error("Email and password are required");
    }
    const admin = await adminRepository.findAdminByEmail(data.email);
    if (!admin) {
        throw new Error("Admin not found");
    }
    const isPasswordValid = await bcrypt.compare(data.password, admin.password);
    if (!isPasswordValid) {
        throw new Error("Invalid password");
    }
    const token = jwt.sign({ id: admin._id, role: admin.role }, JWT_SECRET, { expiresIn: "1d" });
    return {
        admin,
        token
    }
}

module.exports = {
    AdminLogin,

}