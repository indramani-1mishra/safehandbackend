const Attendance = require("../modals/attendanceModel");



const createAttendance = async (data) => {
    try {
        const attendance = new Attendance(data);
        return await attendance.save();
    } catch (error) {
        throw error;
    }
}

const getAttendanceByWorkerId = async (workerId) => {
    try {
        return await Attendance.find({ workerId });
    } catch (error) {
        throw error;
    }
}

const getAttendanceByJobCardId = async (jobCardId) => {
    try {
        return await Attendance.find({ jobCardId });
    } catch (error) {
        throw error;
    }
}

const getAttendanceByJobCardIdAndWorkerId = async (jobCardId, workerId) => {
    try {
        return await Attendance.find({ jobCardId, workerId });
    } catch (error) {
        throw error;
    }
}

const getAttendanceByDate = async (date) => {
    try {
        return await Attendance.find({ date })
    } catch (error) {
        throw error;
    }
}

const getAttendanceByWorkerIdAndDate = async (workerId, date) => {
    try {
        return await Attendance.findOne({ workerId, date })
    } catch (error) {
        throw error;
    }
}

const getAttendanceByJobCardIdAndDate = async (jobCardId, date) => {
    try {
        return await Attendance.findOne({ jobCardId, date })
    } catch (error) {
        throw error;
    }
}

const getAttendanceByWorkerIdAndJobCardId = async (workerId, jobCardId) => {
    try {
        return await Attendance.findOne({ workerId, jobCardId })
    } catch (error) {
        throw error;
    }
}

const getAttendanceByWorkerIdAndJobCardIdAndDate = async (workerId, jobCardId, date) => {
    try {
        return await Attendance.findOne({ workerId, jobCardId, date })
    } catch (error) {
        throw error;
    }
}

const updateAttendance = async (id, data) => {
    try {
        return await Attendance.findByIdAndUpdate(id, data, { new: true });
    } catch (error) {
        throw error;
    }
}

const getAllWorkersAttendance = async (skip = 0, limit = 10) => {
    try {
        return await Attendance.find()
            .skip(skip)
            .limit(limit)

    } catch (error) {
        throw error;
    }
}

const deleteAttendance = async (id) => {
    try {
        return await Attendance.findByIdAndDelete(id);
    } catch (error) {
        throw error;
    }
}

module.exports = {
    createAttendance,
    getAttendanceByWorkerId,
    getAttendanceByJobCardId,
    getAttendanceByJobCardIdAndWorkerId, // Added this
    getAttendanceByDate,
    getAttendanceByWorkerIdAndDate,
    getAttendanceByJobCardIdAndDate,
    getAttendanceByWorkerIdAndJobCardId,
    getAttendanceByWorkerIdAndJobCardIdAndDate,
    updateAttendance,
    deleteAttendance,
    getAllWorkersAttendance
}