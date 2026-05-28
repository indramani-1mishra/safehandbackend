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
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
    const parts = formatter.formatToParts(d);
    const day = parts.find(p => p.type === 'day').value;
    const month = parts.find(p => p.type === 'month').value;
    const year = parts.find(p => p.type === 'year').value;
    return `${day}/${month}/${year}`;
};

const constructISTDate = (hours, minutes, baseDate = new Date()) => {
    const formatter = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', year: 'numeric', month: 'numeric', day: 'numeric' });
    const parts = formatter.formatToParts(baseDate);
    const year = parts.find(p => p.type === 'year').value;
    const month = parts.find(p => p.type === 'month').value;
    const day = parts.find(p => p.type === 'day').value;
    const isoString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00.000+05:30`;
    return new Date(isoString);
};

// Helper: Get scheduled check-in time from JobCard
const getScheduledCheckInTime = (jobCard) => {
    if (jobCard.checkInTime && typeof jobCard.checkInTime === "string" && jobCard.checkInTime.includes(":")) {
        const parts = jobCard.checkInTime.split(":");
        return { hours: parseInt(parts[0], 10), minutes: parseInt(parts[1], 10) };
    }
    if (jobCard.checkInTime && jobCard.checkInTime instanceof Date && !isNaN(jobCard.checkInTime.getTime())) {
        const formatter = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false });
        const parts = formatter.formatToParts(jobCard.checkInTime);
        const hours = parseInt(parts.find(p => p.type === 'hour').value, 10);
        const minutes = parseInt(parts.find(p => p.type === 'minute').value, 10);
        return { hours, minutes };
    }
    // Fallback: parse confirmSlot
    const slot = jobCard.patientDetails?.confirmSlot || "";
    const match = slot.match(/(\d+)(?::(\d+))?\s*(AM|PM)?/i);
    if (match) {
        let hours = parseInt(match[1]);
        let minutes = match[2] ? parseInt(match[2]) : 0;
        let ampm = match[3] ? match[3].toUpperCase() : null;
        if (ampm === "PM" && hours < 12) hours += 12;
        if (ampm === "AM" && hours === 12) hours = 0;
        return { hours, minutes };
    }
    return { hours: 9, minutes: 0 }; // default fallback
};

// Helper: Get scheduled check-out time from JobCard
const getScheduledCheckOutTime = (jobCard) => {
    if (jobCard.checkOutTime && typeof jobCard.checkOutTime === "string" && jobCard.checkOutTime.includes(":")) {
        const parts = jobCard.checkOutTime.split(":");
        return { hours: parseInt(parts[0], 10), minutes: parseInt(parts[1], 10) };
    }
    if (jobCard.checkOutTime && jobCard.checkOutTime instanceof Date && !isNaN(jobCard.checkOutTime.getTime())) {
        const formatter = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false });
        const parts = formatter.formatToParts(jobCard.checkOutTime);
        const hours = parseInt(parts.find(p => p.type === 'hour').value, 10);
        const minutes = parseInt(parts.find(p => p.type === 'minute').value, 10);
        return { hours, minutes };
    }
    // Fallback: parse confirmSlot range
    const slot = jobCard.patientDetails?.confirmSlot || "";
    const parts = slot.split(/(?:-|to)/i);
    if (parts.length > 1) {
        const checkoutStr = parts[1].trim();
        const match = checkoutStr.match(/(\d+)(?::(\d+))?\s*(AM|PM)?/i);
        if (match) {
            let hours = parseInt(match[1]);
            let minutes = match[2] ? parseInt(match[2]) : 0;
            let ampm = match[3] ? match[3].toUpperCase() : null;
            if (ampm === "PM" && hours < 12) hours += 12;
            if (ampm === "AM" && hours === 12) hours = 0;
            return { hours, minutes };
        }
    }
    const checkin = getScheduledCheckInTime(jobCard);
    return { hours: (checkin.hours + 12) % 24, minutes: checkin.minutes };
};

// Helper: Format Date/Time to HH:MM AM/PM
const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true });
};

const requestAttendanceOtpService = async (data) => {
    try {
        const { jobCardId, workerId, serviceType, type } = data; // type: "checkin" or "checkout" for 12hr

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

        const resolvedServiceType = serviceType || jobCard.serviceDetails?.timing || jobCard.serviceDetails?.service?.serviceType || "24 hour";
        const normalizedType = (resolvedServiceType || "").toLowerCase().trim();
        const isOneTime = normalizedType.includes("one") || normalizedType.includes("1-time");
        const is12Hour = normalizedType.includes("12") || normalizedType.includes("12hr") || normalizedType.includes("12 hour");
        const is24Hour = normalizedType.includes("24") || normalizedType.includes("24hr") || normalizedType.includes("24 hour") || (!isOneTime && !is12Hour);

        const today = getdate();

        if (isOneTime) {
            const existingAttendance = await attendenceWorkerRepository.getAttendanceByWorkerIdAndJobCardIdAndDate(workerId, jobCardId, today);
            if (existingAttendance) {
                throw new Error("Attendance already marked for today for this job");
            }

            const scheduledTime = getScheduledCheckInTime(jobCard);
            const now = new Date();
            const expectedTime = constructISTDate(scheduledTime.hours, scheduledTime.minutes, now);
            const windowStart = expectedTime;
            const windowEnd = new Date(expectedTime.getTime() + 30 * 60 * 1000);

            if (now < windowStart || now > windowEnd) {
                throw new Error(`OTP can only be requested between ${formatTime(windowStart)} and ${formatTime(windowEnd)}`);
            }
        } else if (is12Hour) {
            if (!type || !["checkin", "checkout"].includes(type.toLowerCase())) {
                throw new Error("For 12 hour service, 'type' (checkin or checkout) is required");
            }
            const mode = type.toLowerCase();

            const scheduledCheckIn = getScheduledCheckInTime(jobCard);
            const scheduledCheckOut = getScheduledCheckOutTime(jobCard);
            const crossesMidnight = scheduledCheckOut.hours < scheduledCheckIn.hours;

            let searchDate = today;
            if (mode === "checkout" && crossesMidnight) {
                const now = new Date();
                const yesterdayDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                searchDate = normalizeDate(yesterdayDate);
            }

            const existingAttendance = await attendenceWorkerRepository.getAttendanceByWorkerIdAndJobCardIdAndDate(workerId, jobCardId, searchDate);

            if (mode === "checkin") {
                if (existingAttendance && existingAttendance.checkInTime) {
                    throw new Error("Already checked in for today");
                }
                const scheduledCheckIn = getScheduledCheckInTime(jobCard);
                const now = new Date();
                const expectedCheckIn = constructISTDate(scheduledCheckIn.hours, scheduledCheckIn.minutes, now);

                // Allow check-in up to 30 minutes before the scheduled time
                const allowedCheckInStart = new Date(expectedCheckIn.getTime() - 30 * 60 * 1000);
                if (now < allowedCheckInStart) {
                    console.log(now, "now", allowedCheckInStart, "allowedCheckInStart");
                    throw new Error(`Check-in is not allowed before ${formatTime(allowedCheckInStart)}`);
                }
            } else { // checkout
                if (!existingAttendance || !existingAttendance.checkInTime) {
                    throw new Error("Please check-in first before checking out");
                }
                if (existingAttendance.checkOutTime) {
                    throw new Error("Already checked out for today");
                }

                const scheduledCheckOut = getScheduledCheckOutTime(jobCard);
                const now = new Date();
                const scheduledCheckIn = getScheduledCheckInTime(jobCard);
                const expectedCheckIn = constructISTDate(scheduledCheckIn.hours, scheduledCheckIn.minutes, existingAttendance.checkInTime);
                let expectedCheckOut = constructISTDate(scheduledCheckOut.hours, scheduledCheckOut.minutes, expectedCheckIn);
                if (expectedCheckOut < expectedCheckIn) {
                    expectedCheckOut.setDate(expectedCheckOut.getDate() + 1);
                }

                const checkoutWindowStart = new Date(expectedCheckOut.getTime() - 30 * 60 * 1000);
                const checkoutWindowEnd = new Date(expectedCheckOut.getTime() + 30 * 60 * 1000);

                if (now < checkoutWindowStart) {
                    throw new Error(`Please continue OTP after checkout window starts (at ${formatTime(checkoutWindowStart)})`);
                }
                if (now > checkoutWindowEnd) {
                    throw new Error(`Checkout window has expired. It was only allowed until ${formatTime(checkoutWindowEnd)}`);
                }
            }
        } else if (is24Hour) {
            const existingAttendance = await attendenceWorkerRepository.getAttendanceByWorkerIdAndJobCardIdAndDate(workerId, jobCardId, today);
            if (existingAttendance) {
                throw new Error("Attendance already marked for today for this job");
            }
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
            date,
            type,
            serviceType
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
                                markedBy: "admin",
                                todaySalary: null, // Reset todaySalary so it falls back to full day cost
                                actualHours: 0,
                                billableHours: 0,
                                checkInTime: null,
                                checkOutTime: null
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
                    markedBy: "admin",
                    todaySalary: null, // Falls back to full day cost
                    actualHours: 0,
                    billableHours: 0,
                    checkInTime: null,
                    checkOutTime: null
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

        const resolvedServiceType = serviceType || jobCard.serviceDetails?.timing || jobCard.serviceDetails?.service?.serviceType || "24 hour";
        const normalizedType = (resolvedServiceType || "").toLowerCase().trim();
        const isOneTime = normalizedType.includes("one") || normalizedType.includes("1-time");
        const is12Hour = normalizedType.includes("12") || normalizedType.includes("12hr") || normalizedType.includes("12 hour");
        const is24Hour = normalizedType.includes("24") || normalizedType.includes("24hr") || normalizedType.includes("24 hour") || (!isOneTime && !is12Hour);

        let searchDate = attendanceDate;
        if (is12Hour && type && type.toLowerCase() === "checkout") {
            const scheduledCheckIn = getScheduledCheckInTime(jobCard);
            const scheduledCheckOut = getScheduledCheckOutTime(jobCard);
            const crossesMidnight = scheduledCheckOut.hours < scheduledCheckIn.hours;
            if (crossesMidnight && !date) {
                const now = new Date();
                const yesterdayDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                searchDate = normalizeDate(yesterdayDate);
            }
        }

        const existingAttendance =
            await attendenceWorkerRepository
                .getAttendanceByWorkerIdAndJobCardIdAndDate(
                    workerId,
                    jobCardId,
                    searchDate
                );

        if (!is12Hour && existingAttendance) {
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

        let attendance;

        if (isOneTime) {
            attendance = await attendenceWorkerRepository.createAttendance({
                jobCardId,
                workerId,
                date: attendanceDate,
                status: "present",
                markedBy: "Worker",
                checkInTime: new Date(),
                todaySalary: jobCard.perDayNurseCost || 0
            });
        } else if (is12Hour) {
            if (!type || !["checkin", "checkout"].includes(type.toLowerCase())) {
                throw new Error("For 12 hour service, 'type' (checkin or checkout) is required");
            }
            const mode = type.toLowerCase();

            if (mode === "checkin") {
                if (existingAttendance && existingAttendance.checkInTime) {
                    throw new Error("Already checked in for today");
                }

                if (existingAttendance) {
                    attendance = await attendenceWorkerRepository.updateAttendance(existingAttendance._id, {
                        checkInTime: new Date(),
                        status: "pending",
                        markedBy: "Worker"
                    });
                } else {
                    attendance = await attendenceWorkerRepository.createAttendance({
                        jobCardId,
                        workerId,
                        date: attendanceDate,
                        status: "pending",
                        markedBy: "Worker",
                        checkInTime: new Date()
                    });
                }
            } else { // checkout
                if (!existingAttendance || !existingAttendance.checkInTime) {
                    throw new Error("Please check-in first before checking out");
                }
                if (existingAttendance.checkOutTime) {
                    throw new Error("Already checked out for today");
                }

                const actualCheckIn = existingAttendance.checkInTime;
                const actualCheckOut = new Date();

                const scheduledCheckIn = getScheduledCheckInTime(jobCard);
                const scheduledCheckOut = getScheduledCheckOutTime(jobCard);

                const expectedCheckIn = constructISTDate(scheduledCheckIn.hours, scheduledCheckIn.minutes, actualCheckIn);

                let expectedCheckOut = constructISTDate(scheduledCheckOut.hours, scheduledCheckOut.minutes, expectedCheckIn);
                if (expectedCheckOut < expectedCheckIn) {
                    expectedCheckOut.setDate(expectedCheckOut.getDate() + 1);
                }

                const effectiveCheckIn = new Date(Math.max(actualCheckIn.getTime(), expectedCheckIn.getTime()));
                const effectiveCheckOut = new Date(Math.min(actualCheckOut.getTime(), expectedCheckOut.getTime()));

                let scheduledHours = (expectedCheckOut.getTime() - expectedCheckIn.getTime()) / (1000 * 60 * 60);
                if (scheduledHours <= 0) {
                    scheduledHours = 12; // Fallback to 12 hours
                }

                let billableHours = (effectiveCheckOut.getTime() - effectiveCheckIn.getTime()) / (1000 * 60 * 60);
                billableHours = Math.max(0, Math.min(billableHours, scheduledHours));

                const actualHours = (actualCheckOut.getTime() - actualCheckIn.getTime()) / (1000 * 60 * 60);

                const perDayCost = jobCard.perDayNurseCost || 0;
                const ratio = billableHours / scheduledHours;
                const todaySalary = Math.round(perDayCost * ratio * 100) / 100;

                attendance = await attendenceWorkerRepository.updateAttendance(existingAttendance._id, {
                    checkOutTime: actualCheckOut,
                    actualHours,
                    billableHours,
                    todaySalary,
                    status: "present"
                });
            }
        } else { // 24 hours
            attendance = await attendenceWorkerRepository.createAttendance({
                jobCardId,
                workerId,
                date: attendanceDate,
                status: "present",
                markedBy: "Worker",
                checkInTime: new Date(),
                todaySalary: jobCard.perDayNurseCost || 0
            });
        }

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