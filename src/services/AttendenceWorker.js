const mongoose = require("mongoose");
const attendenceWorkerRepository = require("../repository/attendenceWorker");
const jobCardRepository = require("../repository/jobcartRepository");
const workerRepository = require("../repository/workerRepository");
const ClientRepository = require("../repository/ClientRepository");
const { updateWorkerGlobalBalance } = require("./WorkerPayoutService");
const { generateSecureOtp, hashOtp, verifyOtp } = require('../utils/jenratesixdigitOtp');
const sendOtpThroughWhatsapp = require('../utils/sendOtpThroughWhatsapp');
const getdate = require("../utils/getCurrentDate");
const { sendFcmNotification } = require('../utils/fcmService');

const VALID_STATUS = ["present", "absent", "leave"];


const normalizeDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
};


const requestAttendanceOtpService = async (data) => {
    try {
        const { jobCardId, workerId } = data;

        const jobCard = await jobCardRepository.getJobCardById(jobCardId);
        if (!jobCard) {
            throw new Error("Job card not found");
        }

        const worker = await workerRepository.findWorkerById(workerId);
        if (!worker) {
            throw new Error("Worker not found");
        }

        if (!jobCard.workers.assigned._id || jobCard.workers.assigned._id.toString() !== workerId.toString()) {
            throw new Error("Worker is not assigned to this job card");
        }

        const today = getdate();
        const existingAttendance = await attendenceWorkerRepository.getAttendanceByWorkerIdAndJobCardIdAndDate(workerId, jobCardId, today);
        if (existingAttendance) {
            throw new Error("Attendance already marked for today for this job");
        }

        const clientPhone = jobCard.patientDetails.phone;
        const otp = generateSecureOtp();
        await sendOtpThroughWhatsapp(clientPhone, otp);
        const hashedOtp = await hashOtp(otp);
        await workerRepository.updateWorker(workerId, { otp: hashedOtp, otpExpires: Date.now() + 5 * 60 * 1000 }); // Increased to 5 mins

        return {
            success: true,
            message: "OTP sent to client successfully"
        };
    } catch (error) {
        throw new Error(error.message || "Failed to send OTP");
    }
};

const verifyAttendanceOtpService = async (data) => {
    try {

        const {
            jobCardId,
            workerId,
            otp,
            adminId,
            status,
            date
        } = data;

        // Common normalized date
        const attendanceDate = date || getdate();

        // Check Job Card
        const jobCard = await jobCardRepository.getJobCardById(jobCardId);

        if (!jobCard) {
            throw new Error("Job card not found");
        }

        if (jobCard.status === "completed") {
            throw new Error("Job card is already completed");
        }

        /**
         * =========================================================
         * ADMIN ATTENDANCE FLOW
         * =========================================================
         */
        if (adminId && status) {
            const normalizedStatus = status.toLowerCase();
            if (!["present", "absent", "pending"].includes(normalizedStatus)) {
                throw new Error("Invalid status value. Must be present, absent, or pending.");
            }

            const existingAttendance =
                await attendenceWorkerRepository
                    .getAttendanceByJobCardIdAndWorkerIdAndDate(
                        jobCardId,
                        workerId,
                        attendanceDate
                    );

            // UPDATE EXISTING ATTENDANCE
            if (existingAttendance) {
                // Prevent unnecessary update
                if (existingAttendance.status === normalizedStatus) {
                    return {
                        success: true,
                        message: `Attendance already marked as ${normalizedStatus}`,
                        data: existingAttendance
                    };
                }

                const updatedAttendance =
                    await attendenceWorkerRepository
                        .updateAttendanceStatus(
                            jobCardId,
                            workerId,
                            attendanceDate,
                            {
                                adminId,
                                status: normalizedStatus,
                                markedBy: "admin"
                            }
                        );

                // Recalculate global balance
                await updateWorkerGlobalBalance(workerId);

                return {
                    success: true,
                    message: "Attendance updated successfully",
                    data: updatedAttendance
                };
            }

            // CREATE NEW ATTENDANCE
            const createdAttendance =
                await attendenceWorkerRepository.createAttendance({
                    jobCardId,
                    workerId,
                    adminId,
                    date: attendanceDate,
                    status: normalizedStatus,
                    markedBy: "admin"
                });

            // Recalculate global balance
            await updateWorkerGlobalBalance(workerId);

            return {
                success: true,
                message: "Attendance created successfully",
                data: createdAttendance
            };
        }

        /**
         * =========================================================
         * WORKER OTP ATTENDANCE FLOW
         * =========================================================
         */

        const existingAttendance =
            await attendenceWorkerRepository
                .getAttendanceByWorkerIdAndJobCardIdAndDate(
                    workerId,
                    jobCardId,
                    attendanceDate
                );

        if (existingAttendance) {
            throw new Error(
                "Attendance already marked for today for this job"
            );
        }

        // Check Worker
        const worker =
            await workerRepository.findWorkerById(workerId);

        if (!worker) {
            throw new Error("Worker not found");
        }

        // Validate OTP
        if (
            !worker.otp ||
            !worker.otpExpires ||
            worker.otpExpires < Date.now()
        ) {
            throw new Error(
                "OTP expired or not found. Please request a new one."
            );
        }

        const verifyOtp1 = await verifyOtp(otp, worker.otp);

        if (!verifyOtp1) {
            throw new Error("Invalid OTP");
        }

        // Clear OTP
        await workerRepository.updateWorker(workerId, {
            otp: null,
            otpExpires: null
        });

        // Create Attendance
        const attendance =
            await attendenceWorkerRepository.createAttendance({
                jobCardId,
                workerId,
                date: attendanceDate,
                status: "present",
                markedBy: "Worker"
            });

        // Recalculate worker global balance
        await updateWorkerGlobalBalance(workerId);

        /**
         * =========================================================
         * SEND FCM NOTIFICATION
         * =========================================================
         */
        if (attendance && worker.fcmToken) {

            await sendFcmNotification(worker.fcmToken, {
                title: "Job Attendance Verified",
                body: `Your attendance has been marked successfully for patient ${jobCard?.patientDetails?.name}.`,
                data: {
                    jobId: jobCardId.toString(),
                    type: "attendance_verified"
                }
            });
        }

        return {
            success: true,
            message: "Attendance verified successfully",
            data: attendance
        };

    } catch (error) {

        // Mongo Duplicate Key Error
        if (
            error.code === 11000 ||
            error.message.includes("E11000 duplicate key error")
        ) {
            throw new Error(
                "Attendance is already marked for today!"
            );
        }

        throw new Error(
            error.message || "Failed to verify attendance"
        );
    }
};
// ✅ Get Attendance by WorkerId (with pagination)
const getAttendanceByWorkerIdService = async (workerId, page = 1, limit = 10) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(workerId)) {
            throw new Error("Invalid workerId");
        }

        const skip = (page - 1) * limit;

        const attendance = await attendenceWorkerRepository.getAttendanceByWorkerId(
            workerId,
            skip,
            limit
        );

        return {
            success: true,
            data: attendance
        };
    } catch (error) {
        throw new Error(error.message);
    }
};

const getAttendanceByJobCardIdService = async (jobCardId) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(jobCardId)) {
            throw new Error("Invalid jobCardId");
        }
        const attendance = await attendenceWorkerRepository.getAttendanceByJobCardId(jobCardId);
        return {
            success: true,
            data: attendance
        };
    } catch (error) {
        throw new Error(error.message);
    }
};

const getAttendanceByJobCardIdAndWorkerIdService = async (jobCardId, workerId) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(jobCardId) || !mongoose.Types.ObjectId.isValid(workerId)) {
            throw new Error("Invalid IDs");
        }
        const attendance = await attendenceWorkerRepository.getAttendanceByJobCardIdAndWorkerId(jobCardId, workerId);
        return {
            success: true,
            data: attendance
        };
    } catch (error) {
        throw new Error(error.message);
    }
};


const getAttendanceByDateService = async (date, page = 1, limit = 10) => {
    try {
        const skip = (page - 1) * limit;
        const formattedDate = normalizeDate(date);

        const attendance = await attendenceWorkerRepository.getAttendanceByDate(formattedDate, skip, limit);

        return {
            success: true,
            data: attendance
        };
    } catch (error) {
        throw new Error(error.message);
    }
};

// ✅ Update Attendance
const updateAttendanceService = async (id, data) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error("Invalid attendance ID");
        }

        if (data.status && !VALID_STATUS.includes(data.status.toLowerCase())) {
            throw new Error("Invalid status value");
        }

        const updatedAttendance = await attendenceWorkerRepository.updateAttendance(id, {
            ...data,
            status: data.status?.toLowerCase()
        });

        return {
            success: true,
            message: "Attendance updated successfully",
            data: updatedAttendance
        };
    } catch (error) {
        throw new Error(error.message);
    }
};

// ✅ Delete Attendance
const deleteAttendanceService = async (id) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error("Invalid attendance ID");
        }

        const deletedAttendance = await attendenceWorkerRepository.deleteAttendance(id);

        return {
            success: true,
            message: "Attendance deleted successfully",
            data: deletedAttendance
        };
    } catch (error) {
        throw new Error(error.message);
    }
};

const getAllWorkersAttendanceService = async (page = 1, limit = 10) => {
    try {
        const skip = (page - 1) * limit;
        const attendance = await attendenceWorkerRepository.getAllWorkersAttendance(skip, limit);
        return {
            success: true,
            data: attendance
        };
    } catch (error) {
        throw new Error(error.message);
    }
};
module.exports = {
    requestAttendanceOtpService,
    verifyAttendanceOtpService,
    getAttendanceByWorkerIdService,
    getAttendanceByJobCardIdService,
    getAttendanceByJobCardIdAndWorkerIdService,
    getAttendanceByDateService,
    updateAttendanceService,
    deleteAttendanceService,
    getAllWorkersAttendanceService
};