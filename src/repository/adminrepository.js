const Admin = require("../modals/adminModal");

const createAdmin = async (data) => {
    const admin = new Admin(data);
    return await admin.save();
};

const findAdminByEmail = async (email) => {
    return await Admin.findOne({ email });
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

module.exports = {
    createAdmin,
    findAdminByEmail,
    updateAdmin,
    deleteAdmin,
    getAllAdmins,
    getAdminById
};