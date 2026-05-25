const AdminPermission = require("../modals/AdminPermissionModel");

const populateAdmin = { path: "adminId", select: "name email phone role accountStatus" };

const createAdminPermission = async (data) => {
    const permission = new AdminPermission(data);
    return await permission.save();
};

const upsertAdminPermissionByAdminId = async (adminId, permissions) => {
    return await AdminPermission.findOneAndUpdate(
        { adminId },
        { adminId, permissions },
        { returnDocument: "after", upsert: true, runValidators: true }
    ).populate(populateAdmin);
};

const findPermissionByAdminId = async (adminId) => {
    return await AdminPermission.findOne({ adminId }).populate(populateAdmin);
};

const findPermissionById = async (permissionId) => {
    const permission = await AdminPermission.findById(permissionId).populate(populateAdmin);
    if (!permission) throw new Error("Admin permission not found");
    return permission;
};

const updatePermissionByAdminId = async (adminId, data) => {
    return await AdminPermission.findOneAndUpdate(
        { adminId },
        { $set: data },
        { returnDocument: "after", runValidators: true }
    ).populate(populateAdmin);
};

const updatePermissionById = async (permissionId, data) => {
    const permission = await AdminPermission.findByIdAndUpdate(
        permissionId,
        { $set: data },
        { returnDocument: "after", runValidators: true }
    ).populate(populateAdmin);

    if (!permission) throw new Error("Admin permission not found");
    return permission;
};

const deletePermissionByAdminId = async (adminId) => {
    return await AdminPermission.findOneAndDelete({ adminId });
};

const deletePermissionById = async (permissionId) => {
    const permission = await AdminPermission.findByIdAndDelete(permissionId);
    if (!permission) throw new Error("Admin permission not found");
    return permission;
};

const getAllAdminPermissions = async (query = {}) => {
    const { page = 1, limit = 50 } = query;

    return await AdminPermission.find()
        .populate(populateAdmin)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));
};

const hasModuleAction = async (adminId, moduleKey, actionKey) => {
    const permissionRecord = await AdminPermission.findOne({ adminId }).select("permissions");
    if (!permissionRecord) return false;

    const modulePermission = permissionRecord.permissions.find(
        (item) => item.module === moduleKey
    );

    return modulePermission?.actions?.includes(actionKey) ?? false;
};

module.exports = {
    createAdminPermission,
    upsertAdminPermissionByAdminId,
    findPermissionByAdminId,
    findPermissionById,
    updatePermissionByAdminId,
    updatePermissionById,
    deletePermissionByAdminId,
    deletePermissionById,
    getAllAdminPermissions,
    hasModuleAction,
};
