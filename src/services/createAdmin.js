const adminRepository = require("../repository/adminrepository");

const createAdminService = async (data) => {
    if (!data.email) throw new Error("Email is required");
    if (!data.password) throw new Error("Password is required");
    if (!data.name) throw new Error("Name is required");
    if (!data.phone) throw new Error("Phone is required");
    if (!data.role) throw new Error("Role is required");

    // ✅ Better validations
    if (data.password.length < 6) {
        throw new Error("Password must be at least 6 characters long");
    }

    if (!/^\d{10}$/.test(data.phone)) {
        throw new Error("Phone must be 10 digits");
    }

    if (!/^\S+@\S+\.\S+$/.test(data.email)) {
        throw new Error("Invalid email");
    }

    const existingAdmin = await adminRepository.findAdminByEmail(data.email);
    if (existingAdmin) {
        throw new Error("Admin already exists");
    }

    return await adminRepository.createAdmin(data);
};

const updateAdminService = async (id, data) => {
    const admin = await adminRepository.getAdminById(id);
    if (!admin) {
        throw new Error("Admin not found");
    }

    return await adminRepository.updateAdmin(id, data);
};

const getAllAdminsService = async (query) => {
    return await adminRepository.getAllAdmins(query);
};

const makeAdmin = async (id) => {
    const admin = await adminRepository.getAdminById(id);
    if (!admin) {
        throw new Error("Admin not found");
    }

    return await adminRepository.updateAdmin(id, { role: "admin" });
};

module.exports = {
    createAdminService,
    findAdminByEmailService: adminRepository.findAdminByEmail,
    updateAdminService,
    deleteAdminService: adminRepository.deleteAdmin,
    getAllAdminsService,
    getAdminByIdService: adminRepository.getAdminById,
    makeAdmin
};