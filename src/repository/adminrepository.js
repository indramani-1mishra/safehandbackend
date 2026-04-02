const Admin = require("../modals/adminModal");

const createAdmin = async (data) => {
    const admin = new Admin(data);
    return await admin.save();
};

const findAdminByEmail = async (email) => {
    return await Admin.findOne({ email }).select("+password");
};

const updateAdmin = async (id, data) => {
    return await Admin.findByIdAndUpdate(
        id,
        { $set: data },
        { returnDocument: 'after', runValidators: true }
    );
};

const deleteAdmin = async (id) => {
    return await Admin.findByIdAndDelete(id);
};

const getAllAdmins = async (query = {}) => {
    const { page = 1, limit = 10 } = query;

    return await Admin.find()
        .select("-password")
        .skip((page - 1) * limit)
        .limit(Number(limit));
};

const getAdminById = async (id) => {
    const admin = await Admin.findById(id).select("-password");
    if (!admin) throw new Error("Admin not found");
    return admin;
};

const saveRefreshToken = async (id, refreshToken) => {
    return await Admin.findByIdAndUpdate(id, { refreshToken });
};

const removeRefreshToken = async (id) => {
    return await Admin.findByIdAndUpdate(id, { $unset: { refreshToken: "" } });
};

const findAdminByRefreshToken = async (refreshToken) => {
    return await Admin.findOne({ refreshToken });
};

module.exports = {
    createAdmin,
    findAdminByEmail,
    updateAdmin,
    deleteAdmin,
    getAllAdmins,
    getAdminById,
    saveRefreshToken,
    removeRefreshToken,
    findAdminByRefreshToken
};