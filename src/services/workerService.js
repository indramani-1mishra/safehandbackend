const workerRepository = require("../repository/workerRepository");
const {
    createWorkerSchema,
    updateWorkerSchema
} = require("../validations/workerValidation");
const AppError = require("../utils/AppError");
const Attendance = require("../modals/attendanceModel");
const JobCard = require("../modals/jobcartModel");
const getdate = require("../utils/getCurrentDate");


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
    try {
        const todayStr = getdate();
        // Fetch all present attendance records for today
        const attendances = await Attendance.find({ date: todayStr, status: "present" }).populate("jobCardId");
        
        // Map workerId -> today's earnings
        const todayEarningsMap = {};
        for (const att of attendances) {
            if (!att.workerId) continue;
            const workerIdStr = att.workerId.toString();
            let earned = 0;
            if (att.jobCardId && att.jobCardId.status === "completed") {
                earned = 0;
            } else if (att.todaySalary !== undefined && att.todaySalary !== null) {
                earned = att.todaySalary;
            } else if (att.jobCardId) {
                earned = att.jobCardId.perDayNurseCost || 0;
            }
            todayEarningsMap[workerIdStr] = (todayEarningsMap[workerIdStr] || 0) + earned;
        }

        // Add todayEarnings to each worker object
        const workersList = workers.map(w => {
            const obj = w.toObject ? w.toObject() : w;
            obj.todayEarnings = todayEarningsMap[obj._id.toString()] || 0;
            return obj;
        });

        return workersList;
    } catch (err) {
        console.error("Error calculating today's earnings in getAllWorkers service:", err);
        return workers;
    }
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

const respondToCheckInAlert = async (workerId, jobCardId, status) => {
    const Worker = require("../modals/workerModel");
    const JobCard = require("../modals/jobcartModel");
    const socketUtils = require("../utils/socket");
    const workerRepository = require("../repository/workerRepository");

    const worker = await Worker.findById(workerId);
    if (!worker) throw new AppError("Worker not found", 404);

    const jobCard = await JobCard.findById(jobCardId);
    if (!jobCard) throw new AppError("Job Card not found", 404);

    const slotIndex = worker.workerBookingSlot.findIndex(
        slot => slot.jobCardId.toString() === jobCardId.toString()
    );

    if (slotIndex === -1) {
        throw new AppError("Booking slot for this job not found on worker", 404);
    }

    if (status === "ontheway") {
        worker.workerBookingSlot[slotIndex].status = "ontheway";
        await worker.save();

        // 👑 Socket Notification to Admin
        const io = socketUtils.getIo();
        io.to("admin_room").emit("worker_ontheway", {
            message: `Worker ${worker.name} is on the way for Job Card #${jobCardId}`,
            jobCardId: jobCardId,
            workerId: workerId,
            workerName: worker.name
        });

        return { message: "Status updated to ontheway", worker };
    } else if (status === "rejected") {
        // Remove workerBookingSlot for this job card
        await workerRepository.removeWorkerBusySlot(workerId, jobCardId);

        // Unassign worker from JobCard and return to pending status
        const updatedJobCard = await JobCard.findByIdAndUpdate(
            jobCardId,
            {
                $set: { "workers.assigned": null, status: "pending", isAssigned: false },
                $pull: { "workers.interested": workerId }
            },
            { new: true }
        );

        // 👑 Socket Notification to Admin
        const io = socketUtils.getIo();
        io.to("admin_room").emit("worker_rejected_job", {
            message: `Worker ${worker.name} has rejected the shift for Job Card #${jobCardId}`,
            jobCardId: jobCardId,
            workerId: workerId,
            workerName: worker.name
        });

        return { message: "Worker unassigned and slot removed", updatedJobCard };
    } else {
        throw new AppError("Invalid status, must be ontheway or rejected", 400);
    }
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
    respondToCheckInAlert,
};