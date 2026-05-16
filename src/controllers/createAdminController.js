const adminService = require("../services/createAdmin");
const { findAdminByEmail } = require('../repository/adminrepository')

const { DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PHONE } = require("../config/serverConfig");
const createAdminController = async (req, res) => {
    try {
        const admin = await adminService.createAdminService(req.body);

        return res.status(201).json({
            success: true,
            data: admin,
            message: "Admin created successfully (pending approval)"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

const updateAdminController = async (req, res) => {
    try {
        const admin = await adminService.updateAdminService(req.params.id, req.body);
        return res.status(200).json({
            success: true,
            data: admin
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

const getAllAdminsController = async (req, res) => {
    try {
        const admins = await adminService.getAllAdminsService(req.query);
        return res.status(200).json({
            success: true,
            data: admins
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

const deleteAdminController = async (req, res) => {
    try {
        const admin = await adminService.deleteAdminService(req.params.id);
        return res.status(200).json({
            success: true,
            data: admin
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

const getAdminByIdController = async (req, res) => {
    try {
        const admin = await adminService.getAdminByIdService(req.params.id);
        return res.status(200).json({
            success: true,
            data: admin
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

const makeAdminController = async (req, res) => {
    try {
        const admin = await adminService.makeAdminService(req.params.id);
        return res.status(200).json({
            success: true,
            data: admin
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

const getProfileController = async (req, res) => {
    try {
        const admin = await adminService.getAdminByIdService(req.user.id);
        return res.status(200).json({
            success: true,
            data: admin
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

const approveAdminController = async (req, res) => {
    try {
        const { id } = req.params;
        const approverId = req.user.id; // Admin making the approval
        
        const admin = await adminService.approveAdminService(id, approverId);
        return res.status(200).json({
            success: true,
            data: admin,
            message: "Admin account approved successfully"
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
}

const deactivateAdminController = async (req, res) => {
    try {
        const { id } = req.params;
        const deactivatorId = req.user.id;
        
        const admin = await adminService.deactivateAdminService(id, deactivatorId);
        return res.status(200).json({
            success: true,
            data: admin,
            message: "Admin account deactivated successfully"
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
}

const createDefaultAdmin = async () => {
    try {
        console.log("Checking for default admin...", DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PHONE);
        const existingAdmins = await findAdminByEmail(DEFAULT_ADMIN_EMAIL)

        // ✅ If admin already exists → do nothing
        if (existingAdmins) {
            console.log("Default Admin already exists ✅", existingAdmins.email);
            return;
        }

        // ✅ Create default admin (Phone + OTP auth only)
        const admin = await adminService.createAdminService({
            name: "Admin",
            phone: DEFAULT_ADMIN_PHONE,
            email: DEFAULT_ADMIN_EMAIL,
            role: "admin",
            accountStatus: "active"  // Set to active by default
        });

        console.log("Default Admin Created ✅", admin.email, "(Active - No approval needed)");

    } catch (error) {
        console.error("Error creating default admin ❌", error);
    }
};


module.exports = {
    createAdminController,
    updateAdminController,
    getAllAdminsController,
    deleteAdminController,
    getAdminByIdController,
    makeAdminController,
    getProfileController,
    approveAdminController,
    deactivateAdminController,
    createDefaultAdmin
}