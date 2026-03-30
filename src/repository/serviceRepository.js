const Service = require("../modals/serviceModel");

const createService = async (data) => {
    const service = new Service(data);
    return await service.save();
};

const updateService = async (id, data) => {
    return await Service.findByIdAndUpdate(
        id,
        { $set: data },
        { returnDocument: 'after', runValidators: true }
    );
};

const deleteService = async (id) => {
    return await Service.findByIdAndDelete(id);
};

const getAllServices = async (query = {}) => {
    const { page = 1, limit = 10 } = query;

    return await Service.find()
        .skip((page - 1) * limit)
        .limit(Number(limit));
};

const getServiceById = async (id) => {
    const service = await Service.findById(id);
    if (!service) throw new Error("Service not found");
    return service;
};

const getonlyservicenameandimage = async () => {
    return await Service.find().select("_id name image description");
}

module.exports = {
    createService,
    updateService,
    deleteService,
    getAllServices,
    getServiceById,
    getonlyservicenameandimage
};
