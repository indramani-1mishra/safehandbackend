const workerTransactionService = require("../services/workerTrancsactionService");

const createTransactionController = async (req, res) => {
    try {
        const transaction = await workerTransactionService.createTransactionService(req.body);
        res.status(201).json(transaction);
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const getAllTransactionsController = async (req, res) => {
    try {
        const response = await workerTransactionService.getAllTransactionsService();
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getTransactionByIdController = async (req, res) => {
    try {
        const response = await workerTransactionService.getTransactionByIdService(req.params.id);
        res.status(200).json(response);
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const getTransactionsByWorkerIdController = async (req, res) => {
    try {
        const response = await workerTransactionService.getTransactionsByWorkerIdService(req.params.workerId);
        res.status(200).json(response);
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const getTransactionsByJobCardIdController = async (req, res) => {
    try {
        const response = await workerTransactionService.getTransactionsByJobCardIdService(req.params.jobCardId);
        res.status(200).json(response);
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = {
    createTransactionController,
    getAllTransactionsController,
    getTransactionByIdController,
    getTransactionsByWorkerIdController,
    getTransactionsByJobCardIdController
};
