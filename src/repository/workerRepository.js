const Worker = require("../modals/workerModel");

const createWorker = async (data) => {
    const worker = new Worker(data);
    return await worker.save();
};

const findWorkerByEmail = async (email) => {
    return await Worker.findOne({ email });
};

const findWorkerByPhone = async (phone) => {
    return await Worker.findOne({ phone });
};

const findWorkerById = async (id) => {
    return await Worker.findById(id);
};

const updateWorker = async (id, data) => {
    return await Worker.findByIdAndUpdate(
        id,
        { $set: data },
        { returnDocument: 'after', runValidators: true }
    );
};


const deleteWorker = async (id) => {
    return await Worker.findByIdAndDelete(id);
};

const getAllWorkers = async (query = {}) => {
    const { page = 1, limit = 10 } = query;

    return await Worker.find()
        .skip((page - 1) * limit)
        .limit(Number(limit));
};

const getWorkerById = async (id) => {
    const worker = await Worker.findById(id);
    if (!worker) throw new Error("Worker not found");
    return worker;
};

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
    findWorkerByRefreshToken
};
