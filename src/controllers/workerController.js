const workerService = require("../services/workerService");

// 🔥 CREATE WORKER CONTROLLER
const createWorkerController = async (req, res) => {
    try {
        const workerData = { ...req.body };


        // Handle uploaded files (Photo & Documents)
        if (req.files) {
            // Check if frontend uses "image" or "photo" as field name
            if (req.files.image && req.files.image.length > 0) {
                workerData.photo = req.files.image[0].location || req.files.image[0].path;
            } else if (req.files.photo && req.files.photo.length > 0) {
                workerData.photo = req.files.photo[0].location || req.files.photo[0].path;
            }

            if (req.files.documents && req.files.documents.length > 0) {
                workerData.documents = req.files.documents.map(file => file.location || file.path);
            }
        }

        // Form-data sometimes sends arrays as Strings. We must parse 'services' string to array if needed.
        if (typeof workerData.services === "string") {
            try {
                workerData.services = JSON.parse(workerData.services);
            } catch (e) {
                workerData.services = [workerData.services]; // If not stringified array, treat as single item array
            }
        }

        const worker = await workerService.createWorker(workerData);

        return res.status(201).json({
            success: true,
            message: "Worker created successfully",
            data: worker
        });

    } catch (error) {
        const statusCode = error.statusCode || 400;
        return res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

// 🔥 UPDATE WORKER CONTROLLER
const updateWorkerController = async (req, res) => {
    try {
        const { id } = req.params;
        const workerData = { ...req.body };

        // Handle uploaded files during update
        if (req.files) {
            if (req.files.image && req.files.image.length > 0) {
                workerData.photo = req.files.image[0].location || req.files.image[0].path;
            } else if (req.files.photo && req.files.photo.length > 0) {
                workerData.photo = req.files.photo[0].location || req.files.photo[0].path;
            }

            if (req.files.documents && req.files.documents.length > 0) {
                // Note: updating documents might just overwrite the array depending on requirement
                workerData.documents = req.files.documents.map(file => file.location || file.path);
            }
        }

        if (typeof workerData.services === "string") {
            try {
                workerData.services = JSON.parse(workerData.services);
            } catch (e) {
                workerData.services = [workerData.services];
            }
        }

        const worker = await workerService.updateWorker(id, workerData);

        return res.status(200).json({
            success: true,
            message: "Worker updated successfully",
            data: worker
        });

    } catch (error) {
        const statusCode = error.statusCode || 400;
        return res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};


// 🔥 GET ALL WORKERS CONTROLLER
const getAllWorkersController = async (req, res) => {
    try {
        const workers = await workerService.getAllWorkers(req.query);

        return res.status(200).json({
            success: true,
            data: workers
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};


// 🔥 GET SINGLE WORKER BY ID CONTROLLER
const getWorkerByIdController = async (req, res) => {
    try {
        const { id } = req.params;
        const worker = await workerService.getWorkerById(id);

        return res.status(200).json({
            success: true,
            data: worker
        });
    } catch (error) {
        const statusCode = error.statusCode || 400;
        return res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};


// 🔥 DELETE WORKER CONTROLLER
const deleteWorkerController = async (req, res) => {
    try {
        const { id } = req.params;
        await workerService.deleteWorker(id);

        return res.status(200).json({
            success: true,
            message: "Worker deleted successfully"
        });
    } catch (error) {
        const statusCode = error.statusCode || 400;
        return res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};


const getWorkerByPhoneController = async (req, res) => {
    try {
        const { phone } = req.params;
        const worker = await workerService.findWorkerByPhone(phone);

        return res.status(200).json({
            success: true,
            data: worker
        });
    } catch (error) {
        const statusCode = error.statusCode || 400;
        return res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

const getWorkerByEmailController = async (req, res) => {
    try {
        const { email } = req.params;
        const worker = await workerService.findWorkerByEmail(email);

        return res.status(200).json({
            success: true,
            data: worker
        });
    } catch (error) {
        const statusCode = error.statusCode || 400;
        return res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

const getFreeWorkersController = async (req, res) => {
    try {
        const workers = await workerService.findFreeWorkersService();

        return res.status(200).json({
            success: true,
            data: workers
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createWorkerController,
    updateWorkerController,
    getAllWorkersController,
    getWorkerByIdController,
    deleteWorkerController,
    getWorkerByPhoneController,
    getWorkerByEmailController,
    getFreeWorkersController
};