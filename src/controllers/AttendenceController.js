const attendenceWorkerService = require("../services/AttendenceWorker");

const requestAttendanceOtpController = async (req, res) => {
    try {
        const response = await attendenceWorkerService.requestAttendanceOtpService(req.body);
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const verifyAttendanceOtpController = async (req, res) => {
    try {
        const response = await attendenceWorkerService.verifyAttendanceOtpService(req.body);
        res.status(201).json(response);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const getAttendanceByWorkerIdController = async (req, res) => {
    try {
        const attendance = await attendenceWorkerService.getAttendanceByWorkerIdService(req.params.workerId);
        res.status(200).json({ success: true, data: attendance });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const getAttendanceByDateController = async (req, res) => {
    try {
        const attendance = await attendenceWorkerService.getAttendanceByDateService(req.params.date);
        res.status(200).json({ success: true, data: attendance });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const updateAttendanceController = async (req, res) => {
    try {
        const attendance = await attendenceWorkerService.updateAttendanceService(req.params.id, req.body);
        res.status(200).json({ success: true, message: "Attendance updated successfully", data: attendance });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const deleteAttendanceController = async (req, res) => {
    try {
        const attendance = await attendenceWorkerService.deleteAttendanceService(req.params.id);
        res.status(200).json({ success: true, message: "Attendance deleted successfully", data: attendance });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const getAllWorkersAttendanceController = async (req, res) => {
    try {
        const attendance = await attendenceWorkerService.getAllWorkersAttendanceService(req.query.page, req.query.limit);
        res.status(200).json({ success: true, data: attendance });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

module.exports = {
    requestAttendanceOtpController,
    verifyAttendanceOtpController,
    getAttendanceByWorkerIdController,
    getAttendanceByDateController,
    updateAttendanceController,
    deleteAttendanceController,
    getAllWorkersAttendanceController
}

