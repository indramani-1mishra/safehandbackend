const Service = require("../modals/serviceModel");

const createService = async (data) => {
    return await Service.create(data);
};

const updateService = async (id, data) => {
    return await Service.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true, runValidators: true }
    ).populate("subCategory", "name");
};

const deleteService = async (id) => {
    return await Service.findByIdAndDelete(id);
};

const getAllServices = async (query = {}) => {
    const { page = 1, limit = 10 } = query;
    return await Service.find()
        .populate({
            path: "subCategory",
            select: "name",
            populate: { path: "category", select: "name" } // Deep populate to get category name too
        })
        .skip((page - 1) * limit)
        .limit(Number(limit));
};

const getServiceBySubCategoryId = async (subCategoryId) => {
    return await Service.find({ subCategory: subCategoryId }).populate("subCategory", "name");
}

const getServiceById = async (id) => {
    const service = await Service.findById(id).populate({
        path: "subCategory",
        select: "name",
        populate: { path: "category", select: "name" }
    });
    if (!service) throw new Error("Service not found");
    return service;
};

const getonlyservicenameandimage = async () => {
    return await Service.find().select("_id name image description");
}

/**
 * Gets a service and specifically filters for a city's price.
 */
const getServiceByidandCity = async (id, city) => {
    return await Service.findOne({
        _id: id,
        "cityAndPrice.city": { $regex: new RegExp(`^${city}$`, 'i') }
    }, {
        name: 1,
        image: 1,
        cityAndPrice: { $elemMatch: { city: city } } // Return only the price for the requested city
    });
}

const getServiceByCityandSubCategoryId = async (city, subCategoryId) => {
    return await Service.find({
        subCategory: subCategoryId,
        "cityAndPrice.city": { $regex: new RegExp(`^${city}$`, 'i') }
    }, {
        name: 1,
        image: 1,
        description: 1,
        features: 1,
        cityAndPrice: { $elemMatch: { city: { $regex: new RegExp(`^${city}$`, 'i') } } }
    });
}

/**
 * Returns a unique list of all cities across all services.
 */
const getallcity = async () => {
    // using distinct for a flat list of cities
    return await Service.distinct("cityAndPrice.city");
}

/**
 * Find service that has this city in its pricing list.
 */
const getServiceByCityName = async (city) => {
    return await Service.find({ "cityAndPrice.city": city });
}

module.exports = {
    createService,
    updateService,
    deleteService,
    getAllServices,
    getServiceById,
    getonlyservicenameandimage,
    getServiceByidandCity,
    getallcity,
    getServiceBySubCategoryId,
    getServiceByCityName,
    getServiceByCityandSubCategoryId
};