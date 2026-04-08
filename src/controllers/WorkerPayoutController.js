const workerPayoutService = require("../services/WorkerPayoutService");

const createWorkerPayout = async (req, res) => {
    try {
        const response = await workerPayoutService.createWorkerPayout(req.body);
        return res.status(201).json({
            success: true,
            data: response,
            message: "Worker payout recorded successfully"
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getWorkerPayoutDue = async (req, res) => {
    try {
        const { workerId, jobCardId } = req.query;
        if (!workerId || !jobCardId) throw new Error("workerId and jobCardId are required");

        const response = await workerPayoutService.getWorkerPayoutDue(workerId, jobCardId);
        return res.status(200).json({
            success: true,
            data: response,
            message: "Worker due balance fetched successfully"
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getWorkerHistory = async (req, res) => {
    try {
        const response = await workerPayoutService.getWorkerPayoutHistory(req.params.workerId);
        return res.status(200).json({ success: true, data: response });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createWorkerPayout,
    getWorkerPayoutDue,
    getWorkerHistory
};
