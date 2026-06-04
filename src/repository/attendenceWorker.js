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
        return await Attendance.find({ workerId }).populate('adminId', 'name');
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
        return await Attendance.find({ jobCardId, workerId }).populate('adminId', 'name');
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
        return await Attendance.findByIdAndUpdate(id, data, { returnDocument: 'after' });
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
const updateAttendanceStatus = async (jobCardId, workerId, date, data) => {
    try {
        return await Attendance.findOneAndUpdate({ jobCardId, workerId, date }, data, { returnDocument: 'after' });
    } catch (error) {
        throw error;
    }
}

const getAttendanceByJobCardIdAndWorkerIdAndDate = async (jobCardId, workerId, date) => {
    try {
        return await Attendance.findOne({ jobCardId, workerId, date });
    } catch (error) {
        throw error;
    }
}

const getAttendanceById = async (id) => {
    try {
        return await Attendance.findById(id);
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
    getAllWorkersAttendance,
    updateAttendanceStatus,
    getAttendanceByJobCardIdAndWorkerIdAndDate,
    getAttendanceById
}