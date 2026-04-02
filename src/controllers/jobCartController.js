const jobcartService = require("../services/jobcartservice");

const createJobCardController = async (req, res) => {
    try {
        console.log(req.body);
        const responseData = await jobcartService.createJobCardService(req.body);
        res.status(201).json({ success: true, message: "Job card created successfully", data: responseData });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

const updateJobCardController = async (req, res) => {
    try {
        const jobCard = await jobcartService.updateJobCardService(req.params.id, req.body);
        res.status(200).json({ success: true, message: "Job card updated successfully", data: jobCard });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

const deleteJobCardController = async (req, res) => {
    try {
        await jobcartService.deleteJobCardService(req.params.id);
        res.status(200).json({ success: true, message: "Job card deleted successfully" });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

const getAllJobCardsController = async (req, res) => {
    try {
        const jobCards = await jobcartService.getAllJobCardsService(req.query);
        res.status(200).json({ success: true, data: jobCards });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const getJobCardByIdController = async (req, res) => {
    try {
        const jobCard = await jobcartService.getJobCardByIdService(req.params.id);
        res.status(200).json({ success: true, data: jobCard });
    } catch (error) {
        res.status(404).json({ success: false, message: error.message });
    }
}

const addWorkerToJobCardController = async (req, res) => {
    try {
        if (!req.body.workerId) return res.status(400).json({ success: false, message: "workerId is required" });
        const jobCard = await jobcartService.addWorkerToJobCardService(req.params.id, req.body.workerId);
        res.status(200).json({ success: true, message: "Worker interest added", data: jobCard });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const removeWorkerFromJobCardController = async (req, res) => {
    try {
        if (!req.body.workerId) return res.status(400).json({ success: false, message: "workerId is required" });
        const jobCard = await jobcartService.removeWorkerFromJobCardService(req.params.id, req.body.workerId);
        res.status(200).json({ success: true, message: "Worker interest removed", data: jobCard });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const assignWorkerToJobCardController = async (req, res) => {
    try {
        if (!req.body.workerId) return res.status(400).json({ success: false, message: "workerId is required" });
        const jobCard = await jobcartService.assignWorkerToJobCardService(req.params.id, req.body.workerId);
        res.status(200).json({ success: true, message: "Worker assigned successfully", data: jobCard });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const getJobCardsByWorkerIdController = async (req, res) => {
    try {
        const jobCards = await jobcartService.getJobCardsByWorkerIdService(req.params.workerId);
        res.status(200).json({ success: true, data: jobCards });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const getJobCardsByStatusController = async (req, res) => {
    try {
        const jobCards = await jobcartService.getJobCardsByStatusService(req.params.status);
        res.status(200).json({ success: true, data: jobCards });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const getJobCardsByStatusAndWorkerIdController = async (req, res) => {
    try {
        const jobCards = await jobcartService.getJobCardsByStatusAndWorkerIdService(req.params.status, req.params.workerId);
        res.status(200).json({ success: true, data: jobCards });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const completeJobCardController = async (req, res) => {
    try {
        const jobCard = await jobcartService.completeJobCardService(req.params.id);
        res.status(200).json({ success: true, message: "Job card marked as completed", data: jobCard });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

module.exports = {
    createJobCardController,
    updateJobCardController,
    deleteJobCardController,
    getAllJobCardsController,
    getJobCardByIdController,
    addWorkerToJobCardController,
    removeWorkerFromJobCardController,
    assignWorkerToJobCardController,
    getJobCardsByWorkerIdController,
    getJobCardsByStatusController,
    getJobCardsByStatusAndWorkerIdController,
    completeJobCardController
}
