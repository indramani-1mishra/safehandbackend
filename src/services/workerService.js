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

    if (value.email === "") {
        value.email = null;
    }

    const { email, phone } = value;

    const [existingEmail, existingPhone] = await Promise.all([
        email ? workerRepository.findWorkerByEmail(email) : Promise.resolve(null),
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

    if (value.email === "") {
        value.email = null;
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
    return await workerRepository.findFreeWorkers();
};

const getWorkersByAdminId = async (adminId) => {
    if (!adminId) {
        throw new AppError("Admin ID is required", 400);
    }

    return await workerRepository.findWorkersByAdminId(adminId);
};

const getWorkersByBusyStatus = async (status) => {
    if (!status) {
        throw new AppError('Status is required. Use "busy" or "free"', 400);
    }

    const normalizedStatus = String(status).toLowerCase();
    if (normalizedStatus !== "busy" && normalizedStatus !== "free") {
        throw new AppError('Status must be "busy" or "free"', 400);
    }

    return await workerRepository.findWorkersByBusyStatus(normalizedStatus);
};

const getWorkersByDateRange = async (startDate, endDate) => {
    if (!startDate || !endDate) {
        throw new AppError("Start date and end date are required", 400);
    }

    const rangeStart = new Date(startDate);
    const rangeEnd = new Date(endDate);

    if (Number.isNaN(rangeStart.getTime()) || Number.isNaN(rangeEnd.getTime())) {
        throw new AppError("Invalid date format", 400);
    }

    if (rangeStart > rangeEnd) {
        throw new AppError("Start date cannot be after end date", 400);
    }

    return await workerRepository.findWorkersByDateRange(startDate, endDate);
};

module.exports = {
    createWorker,
    updateWorker,
    deleteWorker,
    getAllWorkers,
    getWorkerById,
    findWorkerByEmail,
    findWorkerByPhone,
    findFreeWorkersService,
    getWorkersByAdminId,
    getWorkersByBusyStatus,
    getWorkersByDateRange,
};