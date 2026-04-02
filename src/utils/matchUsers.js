const mongoose = require("mongoose");
const workerModel = require("../modals/workerModel");


const matchUsers = async (serviceId, city) => {
    try {
        console.log(serviceId, city);
        // 🔒 Validation
        if (!serviceId || !city) {
            throw new Error("ServiceId and city are required");
        }

        // ✅ Convert to ObjectId (IMPORTANT)
        const serviceObjectId = new mongoose.Types.ObjectId(serviceId);
        console.log(serviceObjectId);

        // ✅ Clean city (trim + lowercase)
        const cleanCity = city.trim();
        console.log(cleanCity);

        // 🚀 Query
        const matchedWorkers = await workerModel.find({
            services: serviceObjectId,
            city: { $regex: `^${cleanCity}$`, $options: "i" }, // case insensitive
            isActive: true,
            isOnline: true,
            isBusy: false,
        }).lean().select(" -refreshToken -createdAt -updatedAt -__v"); // ⚡ performance boost
        console.log(matchedWorkers);
        return matchedWorkers;

    } catch (error) {
        console.error("Error in matchUsers:", error.message);
        throw error;
    }
};

module.exports = matchUsers;



