const workerService = require("../services/workerService");

// 🔥 CREATE WORKER CONTROLLER
const createWorkerController = async (req, res) => {
    try {
        const workerData = { ...req.body };

        const adminId = req?.user?.id;
        console.log(req?.user, "req?.user from worker controller create");
        if (!adminId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }
        workerData.adminId = adminId;
        // Handle uploaded files (Photo & Documents)
        if (req.files) {
            // Check if frontend uses "image" or "photo" as field name
            if (req.files.image && req.files.image.length > 0) {
                workerData.photo = req.files.image[0].location || req.files.image[0].path;
            } else if (req.files.photo && req.files.photo.length > 0) {
                workerData.photo = req.files.photo[0].location || req.files.photo[0].path;
            }

            if (req.files.documents && req.files.documents.length > 0) {
                let documentNames = [];
                if (req.body.documentNames) {
                    if (Array.isArray(req.body.documentNames)) {
                        documentNames = req.body.documentNames;
                    } else if (typeof req.body.documentNames === "string") {
                        try {
                            const parsed = JSON.parse(req.body.documentNames);
                            documentNames = Array.isArray(parsed) ? parsed : [parsed];
                        } catch (e) {
                            documentNames = [req.body.documentNames];
                        }
                    }
                }
                workerData.documents = req.files.documents.map((file, index) => ({
                    url: file.location || file.path,
                    name: documentNames[index] || `Document ${index + 1}`
                }));
            }

            if (req.files.scanner && req.files.scanner.length > 0) {
                workerData.scanner = req.files.scanner[0].location || req.files.scanner[0].path;
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

        if (workerData.phone) {
            const worker = await workerService.findWorkerByPhone(workerData.phone);
            if (worker) {
                return res.status(400).json({
                    success: false,
                    message: "Worker with this phone number already exists"
                });
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
        const adminId = req?.admin?.id || req?.user?.id;
        //   console.log(req?.user, "req?.user from worker controller update")
        if (!adminId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }
        workerData.adminId = adminId;
        // Handle uploaded files during update
        if (req.files) {
            if (req.files.image && req.files.image.length > 0) {
                workerData.photo = req.files.image[0].location || req.files.image[0].path;
            } else if (req.files.photo && req.files.photo.length > 0) {
                workerData.photo = req.files.photo[0].location || req.files.photo[0].path;
            }

            if (req.files.documents && req.files.documents.length > 0) {
                // Note: updating documents might just overwrite the array depending on requirement
                let documentNames = [];
                if (req.body.documentNames) {
                    if (Array.isArray(req.body.documentNames)) {
                        documentNames = req.body.documentNames;
                    } else if (typeof req.body.documentNames === "string") {
                        try {
                            const parsed = JSON.parse(req.body.documentNames);
                            documentNames = Array.isArray(parsed) ? parsed : [parsed];
                        } catch (e) {
                            documentNames = [req.body.documentNames];
                        }
                    }
                }
                workerData.documents = req.files.documents.map((file, index) => ({
                    url: file.location || file.path,
                    name: documentNames[index] || `Document ${index + 1}`
                }));
            }

            if (req.files.scanner && req.files.scanner.length > 0) {
                workerData.scanner = req.files.scanner[0].location || req.files.scanner[0].path;
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

const getWorkersByAdminIdController = async (req, res) => {
    try {
        const { adminId } = req.params;
        const workers = await workerService.getWorkersByAdminId(adminId);

        return res.status(200).json({
            success: true,
            count: workers.length,
            data: workers,
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            success: false,
            message: error.message,
        });
    }
};

const getWorkersByBusyStatusController = async (req, res) => {
    try {
        const { status } = req.params;
        const workers = await workerService.getWorkersByBusyStatus(status);

        return res.status(200).json({
            success: true,
            count: workers.length,
            data: workers,
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            success: false,
            message: error.message,
        });
    }
};

const getWorkersByDateRangeController = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const workers = await workerService.getWorkersByDateRange(startDate, endDate);

        return res.status(200).json({
            success: true,
            count: workers.length,
            data: workers,
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            success: false,
            message: error.message,
        });
    }
};

const respondToCheckInAlertController = async (req, res) => {
    try {
        const { workerId, jobCardId, status } = req.body;

        if (!workerId || !jobCardId || !status) {
            return res.status(400).json({
                success: false,
                message: "workerId, jobCardId, and status are required"
            });
        }

        const result = await workerService.respondToCheckInAlert(workerId, jobCardId, status);

        return res.status(200).json({
            success: true,
            ...result
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

const completeWorkerSelfRegistrationController = async (req, res) => {
    try {
        const workerId = req?.worker?.id;
        if (!workerId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const data = { ...req.body };

        // Parse services if sent as string
        if (typeof data.services === "string") {
            try {
                data.services = JSON.parse(data.services);
            } catch (e) {
                data.services = [data.services];
            }
        }

        const worker = await workerService.completeWorkerSelfRegistration(workerId, data);

        return res.status(200).json({
            success: true,
            message: "Registration profile completed successfully",
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

const submitWorkerTestController = async (req, res) => {
    try {
        const workerId = req?.worker?.id;
        if (!workerId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const worker = await workerService.submitWorkerTest(workerId, req.body);

        return res.status(200).json({
            success: true,
            message: "Test submitted successfully",
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

const updateBankDetailsController = async (req, res) => {
    try {
        const workerId = req?.worker?.id;
        if (!workerId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const data = { ...req.body };
        if (req.files && req.files.scanner && req.files.scanner.length > 0) {
            data.scanner = req.files.scanner[0].location || req.files.scanner[0].path;
        }

        const worker = await workerService.updateBankDetails(workerId, data);

        return res.status(200).json({
            success: true,
            message: "Bank details updated successfully",
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

const uploadDocumentsController = async (req, res) => {
    try {
        const workerId = req?.worker?.id;
        if (!workerId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        if (!req.files || !req.files.documents || req.files.documents.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No documents uploaded"
            });
        }

        let documentNames = [];
        if (req.body.documentNames) {
            if (Array.isArray(req.body.documentNames)) {
                documentNames = req.body.documentNames;
            } else if (typeof req.body.documentNames === "string") {
                try {
                    const parsed = JSON.parse(req.body.documentNames);
                    documentNames = Array.isArray(parsed) ? parsed : [parsed];
                } catch (e) {
                    documentNames = [req.body.documentNames];
                }
            }
        }

        const documents = req.files.documents.map((file, index) => ({
            url: file.location || file.path,
            name: documentNames[index] || `Document ${index + 1}`
        }));

        const worker = await workerService.uploadDocuments(workerId, documents);

        return res.status(200).json({
            success: true,
            message: "Documents uploaded successfully",
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

const adminApproveWorkerController = async (req, res) => {
    try {
        const { id } = req.params;
        const data = { ...req.body };

        if (!id) {
            return res.status(400).json({ success: false, message: "Worker ID is required" });
        }

        // Only allow explicit status fields — no full profile changes via this endpoint
        const allowedFields = [
            "test",
            "testMark",
            "testResult",
            "vcallVerification",
            "documentsUpload",
            "bankDetails",
            "fullWorkerApproved",
            "isActive"
        ];

        const updateFields = {};
        allowedFields.forEach(field => {
            if (data[field] !== undefined) {
                updateFields[field] = data[field];
            }
        });

        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No valid status fields provided. Allowed fields: " + allowedFields.join(", ")
            });
        }

        // Use repository directly to bypass Joi schema validation (status-only update)
        const workerRepository = require("../repository/workerRepository");
        const worker = await workerRepository.updateWorker(id, updateFields);

        if (!worker) {
            return res.status(404).json({ success: false, message: "Worker not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Worker approval status updated successfully",
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

module.exports = {
    createWorkerController,
    updateWorkerController,
    getAllWorkersController,
    getWorkerByIdController,
    deleteWorkerController,
    getWorkerByPhoneController,
    getWorkerByEmailController,
    getFreeWorkersController,
    getWorkersByAdminIdController,
    getWorkersByBusyStatusController,
    getWorkersByDateRangeController,
    respondToCheckInAlertController,
    completeWorkerSelfRegistrationController,
    submitWorkerTestController,
    updateBankDetailsController,
    uploadDocumentsController,
    adminApproveWorkerController
};