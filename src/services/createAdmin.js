const adminRepository = require("../repository/adminrepository");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/serverConfig");
const { createAdminPermission, updatePermissionByAdminId } = require("../repository/adminPermissionRepository");


const createAdminService = async (data) => {

    if (!data.email) {
        throw new Error("Email is required");
    }

    if (!data.name) {
        throw new Error("Name is required");
    }

    if (!data.phone) {
        throw new Error("Phone is required");
    }

    if (!data.role) {
        throw new Error("Role is required");
    }


    // Phone Validation
    if (!/^\d{10}$/.test(data.phone)) {
        throw new Error("Phone must be 10 digits");
    }


    // Email Validation
    if (!/^\S+@\S+\.\S+$/.test(data.email)) {
        throw new Error("Invalid email");
    }


    // Check Existing Admin
    const existingAdmin =
    await adminRepository.findAdminByEmail(data.email);

    if (existingAdmin) {
        throw new Error("Admin already exists");
    }


    // Create Admin
    const admin =
    await adminRepository.createAdmin(data);


    // Create Permissions For HR
    if (data.role === "hr") {

        if (
            !data.permissions ||
            !Array.isArray(data.permissions)
        ) {
            throw new Error(
                "Permissions are required for HR"
            );
        }

        await createAdminPermission({

            adminId: admin._id,

            permissions: data.permissions

        });
    }


    return admin;
};

const approveAdminService = async (id,adminId) => {
    const admin = await adminRepository.getAdminById(id);
    const approver = await adminRepository.getAdminById(adminId);
    if(approver.role!=="admin"){
        throw new Error("Only admin can approve");
    }
    if (!admin) {
        throw new Error("Admin not found");
    }
    const updatedAdmin = await adminRepository.updateAdmin(id, { accountStatus: "active" });
    const token = jwt.sign({ id: updatedAdmin._id, email: updatedAdmin.email, role: updatedAdmin.role }, JWT_SECRET, { expiresIn: "7d" });
    return { admin: updatedAdmin, token };
};

const deactivateAdminService = async (id,adminId) => {
    const admin = await adminRepository.getAdminById(id);
    const deactivator = await adminRepository.getAdminById(adminId);
    if(deactivator.role!=="admin"){
        throw new Error("Only admin can deactivate");
    }
    if (!admin) {
        throw new Error("Admin not found");
    }
    return await adminRepository.updateAdmin(id, { accountStatus: "deactivated" });
}
const updateAdminService = async (id, data) => {
    const admin = await adminRepository.getAdminById(id);
    if (!admin) {
        throw new Error("Admin not found");
    }
   
   const updateData =  await adminRepository.updateAdmin(id, data);
   if(admin.role==="hr"){
    await updatePermissionByAdminId(id,data.permissions)

   }
 return updateData;

};

const getAllAdminsService = async (query) => {
    return await adminRepository.getAllAdmins(query);
};

const makeAdminService = async (id) => {
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
    approveAdminService,
    deactivateAdminService,
    makeAdminService
};