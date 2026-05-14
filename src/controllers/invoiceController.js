const invoiceService = require("../services/invoiceService");

const createInvoiceController = async (req, res) => {
    try {
        const response = await invoiceService.createInvoiceService(req.body);
        return res.status(201).json({ success: true, data: response, message: "Invoice created successfully" });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

const getAllInvoicesController = async (req, res) => {
    try {
        const response = await invoiceService.getAllInvoicesService(req.query);
        return res.status(200).json({ success: true, data: response });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getInvoiceByIdController = async (req, res) => {
    try {
        const response = await invoiceService.getInvoiceByIdService(req.params.id);
        return res.status(200).json({ success: true, data: response });
    } catch (error) {
        return res.status(404).json({ success: false, message: error.message });
    }
};

const getInvoiceByInvoiceNumberController = async (req, res) => {
    try {
        const response = await invoiceService.getInvoiceByInvoiceNumberService(req.params.invoiceNumber);
        return res.status(200).json({ success: true, data: response });
    } catch (error) {
        return res.status(404).json({ success: false, message: error.message });
    }
};

const getInvoicesByJobCardIdController = async (req, res) => {
    try {
        const response = await invoiceService.getInvoicesByJobCardIdService(req.params.jobCardId);
        return res.status(200).json({ success: true, data: response });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getInvoicesByClientPaymentIdController = async (req, res) => {
    try {
        const response = await invoiceService.getInvoicesByClientPaymentIdService(req.params.clientPaymentId);
        return res.status(200).json({ success: true, data: response });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const updateInvoiceController = async (req, res) => {
    try {
        const response = await invoiceService.updateInvoiceService(req.params.id, req.body);
        return res.status(200).json({ success: true, data: response, message: "Invoice updated successfully" });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

const deleteInvoiceController = async (req, res) => {
    try {
        await invoiceService.deleteInvoiceService(req.params.id);
        return res.status(200).json({ success: true, message: "Invoice deleted successfully" });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

const getInvoiceByDateRangeController = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        console.log('Fetching invoices by date range:', { startDate, endDate });
        const response = await invoiceService.getInvoiceByDateRangeService(startDate, endDate);
        return res.status(200).json({ success: true, data: response });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

const getInvoiceByClientNameOrNumberController = async (req, res) => {
    try {
        const { clientName, number } = req.query;
        console.log('Invoice search request received:', { clientName, number });
        const response = await invoiceService.getInvoiceByClientNameOrNumberService({ clientName, number });
        return res.status(200).json({ success: true, data: response });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = {
    createInvoiceController,
    getAllInvoicesController,
    getInvoiceByIdController,
    getInvoiceByInvoiceNumberController,
    getInvoicesByJobCardIdController,
    getInvoicesByClientPaymentIdController,
    updateInvoiceController,
    deleteInvoiceController,
    getInvoiceByDateRangeController,
    getInvoiceByClientNameOrNumberController
};
