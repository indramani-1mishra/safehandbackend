const mongoose = require("mongoose");
const attendenceWorkerRepository = require("../repository/attendenceWorker");
const jobCardRepository = require("../repository/jobcartRepository");
const workerRepository = require("../repository/workerRepository");
const { sendOtp, verifyOtp } = require("../utils/senotp");
const getdate = require("../utils/getCurrentDate");

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

        if (!jobCard.workers.assigned || jobCard.workers.assigned.toString() !== workerId.toString()) {
            throw new Error("Worker is not assigned to this job card");
        }

        // Check if attendance already marked for today
        {/**  const today = getdate();
        const existingAttendance = await attendenceWorkerRepository.getAttendanceByWorkerIdAndJobCardIdAndDate(workerId, jobCardId, today);
        if (existingAttendance) {
            throw new Error("Attendance already marked for today for this job");
        } */}

        const clientPhone = jobCard.patientDetails.phone;
        const response = await sendOtp(`91${clientPhone}`);

        if (response.status !== "pending") {
            throw new Error("Failed to send OTP");
        }

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
        const { jobCardId, workerId, otp } = data;

        const jobCard = await jobCardRepository.getJobCardById(jobCardId);
        if (!jobCard) {
            throw new Error("Job card not found");
        }

        // Double check for duplicate before creating
        {/** FOR TESTIONG 
              const today = getdate();
        const existingAttendance = await attendenceWorkerRepository.getAttendanceByWorkerIdAndJobCardIdAndDate(workerId, jobCardId, today);
        if (existingAttendance) {
            throw new Error("Attendance already marked for today for this job");
        }
            
            */}

        const clientPhone = jobCard.patientDetails.phone;
        {/** const verifyOtp1 = await verifyOtp(`91${clientPhone}`, otp);

        if (verifyOtp1.status !== "approved" ) {
            throw new Error("Failed to verify OTP");
        } */}

        const verifyOtp1 = otp == "123456" ? true : false;
        if (!verifyOtp1) {
            throw new Error("Failed to verify OTP");
        }


        const attendance = await attendenceWorkerRepository.createAttendance({
            jobCardId,
            workerId,
            date: getdate(),
            status: "present"
        });

        return {
            success: true,
            message: "Attendance verified and created successfully",
            data: attendance
        };
    } catch (error) {
        throw new Error(error.message || "Failed to verify attendance");
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
    getAttendanceByDateService,
    updateAttendanceService,
    deleteAttendanceService,
    getAllWorkersAttendanceService
};