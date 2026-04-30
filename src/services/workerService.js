const workerRepository = require("../repository/workerRepository");
const {
    createWorkerSchema,
    updateWorkerSchema
} = require("../validations/workerValidation");
const AppError = require("../utils/AppError");


//  CREATE WORKER
const createWorker = async (data) => {

    const { error, value } = createWorkerSchema.validate(data);

    if (error) {
        throw new AppError(error.details[0].message, 400);
    }

    const { email, phone } = value;

    const [existingEmail, existingPhone] = await Promise.all([
        workerRepository.findWorkerByEmail(email),
        workerRepository.findWorkerByPhone(phone)
    ]);

    if (existingEmail) {
        throw new AppError("Worker already exists with this email", 409);
    }

    if (existingPhone) {
        throw new AppError("Worker already exists with this phone", 409);
    }

    const worker = await workerRepository.createWorker(value);
    return worker;
};


// 🔥 UPDATE WORKER
const updateWorker = async (id, data) => {

    if (!id) {
        throw new AppError("Worker ID is required", 400);
    }

    const { error, value } = updateWorkerSchema.validate(data);

    if (error) {
        throw new AppError(error.details[0].message, 400);
    }

    const worker = await workerRepository.updateWorker(id, value);

    if (!worker) {
        throw new AppError("Worker not found", 404);
    }

    return worker;
};


// 🔥 DELETE WORKER
const deleteWorker = async (id) => {

    if (!id) {
        throw new AppError("Worker ID is required", 400);
    }

    const worker = await workerRepository.deleteWorker(id);

    if (!worker) {
        throw new AppError("Worker not found", 404);
    }

    return worker;
};


// 🔥 GET ALL WORKERS
const getAllWorkers = async (query) => {
    const workers = await workerRepository.getAllWorkers(query);
    return workers;
};


// 🔥 GET WORKER BY ID
const getWorkerById = async (id) => {

    if (!id) {
        throw new AppError("Worker ID is required", 400);
    }

    const worker = await workerRepository.getWorkerById(id);

    if (!worker) {
        throw new AppError("Worker not found", 404);
    }

    return worker;
};


const findWorkerByEmail = async (email) => {
    return await workerRepository.findWorkerByEmail(email);
};

const findWorkerByPhone = async (phone) => {
    return await workerRepository.findWorkerByPhone(phone);
};

const findFreeWorkersService = async () => {
    try {
        const freeWorkers = await workerRepository.findFreeWorkers();
        return freeWorkers;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    createWorker,
    updateWorker,
    deleteWorker,
    getAllWorkers,
    getWorkerById,
    findWorkerByEmail,
    findWorkerByPhone,
    findFreeWorkersService
};