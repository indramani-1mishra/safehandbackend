const clientPaymentService = require("../services/clientPayementService");

const createClientPayment = async (req, res) => {
    try {
        const response = await clientPaymentService.createClientPayment(req.body);
        return res.status(201).json({
            success: true,
            data: response,
            message: "Payment recorded successfully"
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getTodayDuePayments = async (req, res) => {
    try {
        const response = await clientPaymentService.getTodayDuePayments();
        return res.status(200).json({
            success: true,
            data: response,
            message: "Today's due payments fetched successfully"
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getAllClientPayments = async (req, res) => {
    try {
        const response = await clientPaymentService.getAllClientPayments(req.query);
        return res.status(200).json({ success: true, data: response });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getClientPaymentsByJobCardId = async (req, res) => {
    try {
        const response = await clientPaymentService.getClientPaymentsByJobCardId(req.params.jobCardId);
        return res.status(200).json({ success: true, data: response });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const deleteClientPayment = async (req, res) => {
    try {
        const response = await clientPaymentService.deleteClientPayment(req.params.id);
        return res.status(200).json({ success: true, message: "Payment deleted" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createClientPayment,
    getTodayDuePayments,
    getAllClientPayments,
    getClientPaymentsByJobCardId,
    deleteClientPayment
};
