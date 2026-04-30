const Worker = require("../modals/workerModel");
const Service = require("../modals/serviceModel"); // Explicitly import Service model



const createWorker = async (data) => {
    const worker = new Worker(data);
    const savedWorker = await worker.save();
    return await savedWorker.populate({ path: 'services', model: Service });
};


const findWorkerByEmail = async (email) => {
    return await Worker.findOne({ email });
};

const findWorkerByPhone = async (phone) => {
    return await Worker.findOne({ phone });
};

const findWorkerById = async (id) => {
    return await Worker.findById(id).populate({ path: 'services', model: Service });
};

const checkWorkerBusyStatus = async (id) => {
    const worker = await Worker.findById(id);
    if (!worker) throw new Error("Worker not found");
    return worker.isBusy;
}


const updateWorker = async (id, data) => {
    return await Worker.findByIdAndUpdate(
        id,
        { $set: data },
        { returnDocument: 'after', runValidators: true }
    ).populate({ path: 'services', model: Service });
};



const deleteWorker = async (id) => {
    return await Worker.findByIdAndDelete(id);
};

const getAllWorkers = async (query = {}) => {
    const { page = 1, limit = 10 } = query;

    return await Worker.find()
        .populate({ path: 'services', model: Service })
        .skip((page - 1) * limit)
        .limit(Number(limit));
};



const getWorkerById = async (id) => {
    const worker = await Worker.findById(id).populate({ path: 'services', model: Service });
    if (!worker) throw new Error("Worker not found");
    return worker;
};



const findFreeWorkers = async () => {
    return await Worker.find({ isBusy: false });
}

const saveRefreshToken = async (id, refreshToken) => {
    return await Worker.findByIdAndUpdate(id, { refreshToken });
}
const removeRefreshToken = async (id) => {
    return await Worker.findByIdAndUpdate(id, { $unset: { refreshToken: "" } });
}
const findWorkerByRefreshToken = async (refreshToken) => {
    return await Worker.findOne({ refreshToken });
}
module.exports = {
    createWorker,
    findWorkerByEmail,
    updateWorker,
    deleteWorker,
    getAllWorkers,
    getWorkerById,
    findWorkerById,
    findWorkerByPhone,
    saveRefreshToken,
    removeRefreshToken,
    findWorkerByRefreshToken,
    findFreeWorkers,
    checkWorkerBusyStatus
};
