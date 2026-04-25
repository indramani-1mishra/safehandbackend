const WorkerPayoutService = require("../services/WorkerPayoutService");

const requestPayoutController = async (req, res) => {
    try {
        const response = await WorkerPayoutService.requestPayoutService(req.body);
        res.status(201).json(response);
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const getPendingPayoutRequestsController = async (req, res) => {
    try {
        const response = await WorkerPayoutService.getPendingPayoutRequestsService();
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const createWorkerPayout = async (req, res) => {
    try {
        const payout = await WorkerPayoutService.createWorkerPayoutService(req.body);
        res.status(201).json({ success: true, data: payout });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getWorkerPayoutDue = async (req, res) => {
    try {
        const { workerId, jobCardId } = req.query;
        const due = await WorkerPayoutService.getWorkerPayoutDue(workerId, jobCardId);
        res.status(200).json({ success: true, data: due });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getWorkerHistory = async (req, res) => {
    try {
        const history = await WorkerPayoutService.getWorkerHistoryService(req.params.workerId);
        res.status(200).json({ success: true, data: history });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getWorkerBalanceController = async (req, res) => {
    try {
        const { workerId, jobCardId } = req.query;
        const response = await WorkerPayoutService.getWorkerBalanceService(workerId, jobCardId);
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getAdminAllWorkersPayablesController = async (req, res) => {
    try {
        const response = await WorkerPayoutService.getAdminAllWorkersPayablesService(req.query);
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const approvePayoutRequestController = async (req, res) => {
    try {
        const response = await WorkerPayoutService.approvePayoutRequestService(req.params.id, req.body);
        res.status(200).json(response);
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const getPaidPayoutsController = async (req, res) => {
    try {
        const response = await WorkerPayoutService.getPaidPayoutsService();
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    requestPayoutController,
    getPendingPayoutRequestsController,
    createWorkerPayout,
    getWorkerPayoutDue,
    getWorkerHistory,
    getWorkerBalanceController,
    getAdminAllWorkersPayablesController,
    approvePayoutRequestController,
    getPaidPayoutsController
};
