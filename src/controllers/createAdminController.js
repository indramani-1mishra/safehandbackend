const adminService = require("../services/createAdmin");
const { NODE_ENV } = require("../config/serverConfig");
const { findAdminByEmail } = require('../repository/adminrepository')


const { DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD, DEFAULT_ADMIN_PHONE } = require("../config/serverConfig");
const createAdminController = async (req, res) => {
    try {
        const admin = await adminService.createAdminService(req.body);


        return res.status(201).cookie("adminToken", admin.token, {
            httpOnly: true,
            secure: NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000
        }).json({
            success: true,
            data: admin.admin,
            message: "Admin created successfully"
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

const createDefaultAdmin = async () => {
    try {
        console.log(DEFAULT_ADMIN_PASSWORD, DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PHONE);
        const existingAdmins = await findAdminByEmail(DEFAULT_ADMIN_EMAIL)
        //  const hashedpassword = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);

        // ✅ If admin already exists → do nothing
        if (existingAdmins) {
            console.log("Default Admin already exists ✅", existingAdmins.email);
            return;
        }

        // ✅ Create default admin
        const admin = await adminService.createAdminService({
            name: "Admin",
            phone: DEFAULT_ADMIN_PHONE,
            email: DEFAULT_ADMIN_EMAIL,
            password: DEFAULT_ADMIN_PASSWORD,
            role: "admin"
        });

        console.log("Default Admin Created ✅", admin.email);

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
    createDefaultAdmin
}