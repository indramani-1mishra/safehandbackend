const jobcartRepository = require("../repository/jobcartRepository");
const serviceRepository = require("../repository/serviceRepository");
const matchUsers = require("../utils/matchUsers");
const workerRepository = require("../repository/workerRepository");
const enquiryRepository = require("../repository/enqueryRepository");
const { default: mongoose } = require("mongoose");
const socketUtils = require("../utils/socket");

const { DEFAULT_ADMIN_PHONE } = require("../config/serverConfig");
const { sendFcmNotification } = require("../utils/fcmService");
const ClientRepository = require("../repository/ClientRepository");
const { getLatestClientPaymentByJobCardId, getClientPaymentsByJobCardId } = require("../repository/ClientRepository");
const { getWorkerById, updateWorker } = require("../repository/workerRepository");
const ashineJobCardpdf = require("../utils/ashinejobcart");
const { sendWhatsappPdf } = require("../utils/sendjobassignment");


const normalizeDateOnly = (value) => {
    if (!value) return new Date();
    if (typeof value === "string") {
        const datePart = value.split("T")[0];
        const [year, month, day] = datePart.split("-");
        if (year && month && day) {
            return new Date(Number(year), Number(month) - 1, Number(day));
        }
    }
    return new Date(value);
};

const normalizeTimeToDate = (timeStr, baseDate = new Date()) => {
    if (!timeStr) return null;
    if (timeStr instanceof Date) return timeStr;
    if (typeof timeStr === "string" && timeStr.includes("T")) {
        const date = new Date(timeStr);
        if (!isNaN(date.getTime())) return date;
    }
    if (typeof timeStr === "string") {
        const cleanStr = timeStr.trim().toLowerCase();
        let isPM = cleanStr.includes("pm");
        let isAM = cleanStr.includes("am");

        const match = cleanStr.match(/(\d+)(?::(\d+))?/);
        if (match) {
            let hours = parseInt(match[1], 10);
            let minutes = match[2] ? parseInt(match[2], 10) : 0;

            if (!isNaN(hours) && !isNaN(minutes)) {
                if (isPM && hours < 12) {
                    hours += 12;
                }
                if (isAM && hours === 12) {
                    hours = 0;
                }

                const year = baseDate.getFullYear();
                const month = baseDate.getMonth();
                const dateVal = baseDate.getDate();

                const isoString = `${year}-${String(month + 1).padStart(2, '0')}-${String(dateVal).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00.000+05:30`;
                return new Date(isoString);
            }
        }
    }
    const fallbackDate = new Date(timeStr);
    return isNaN(fallbackDate.getTime()) ? null : fallbackDate;
};

const createJobCardService = async (data) => {
    try {
        // Extract fields according to the nested payload format
        const serviceId = data?.serviceDetails?.service;
        const enquiryId = data?.inquiryId;
        const city = data?.patientDetails?.city;

        if (!serviceId) throw new Error("Service ID is missing in serviceDetails");
        if (!enquiryId) throw new Error("Inquiry ID is missing");

        const service = await serviceRepository.getServiceById(serviceId);
        if (!service) {
            throw new Error("Service not found in DB");
        }
        const enquiry = await enquiryRepository.getEnquiryById(enquiryId);
        if (!enquiry) {
            throw new Error("Enquiry not found in DB");
        }
        const matchedWorkers = await matchUsers(serviceId, city);
        if (!data.isDirectAssignWorker) {
            if (matchedWorkers.length === 0) {
                throw new Error(`No workers found for service: ${service.name || serviceId} in city: ${city}`);
            }
        }
        if (data.isDirectAssignWorker && !data.assignedWorkerId) {
            throw new Error("Worker ID is required for direct assignment");
        }
        if (data.isDirectAssignWorker && data.assignedWorkerId) {
            const worker = await workerRepository.getWorkerById(data.assignedWorkerId);
            if (!worker) {
                throw new Error("Worker not found in DB");
            }
        }
        const normalizedServiceStart = normalizeDateOnly(data.serviceStart || data.startDate);
        const normalizedCheckIn = data.checkInTime ? normalizeTimeToDate(data.checkInTime, normalizedServiceStart) : null;
        let normalizedCheckOut = data.checkOutTime ? normalizeTimeToDate(data.checkOutTime, normalizedServiceStart) : null;

        if (normalizedCheckIn && normalizedCheckOut && normalizedCheckOut < normalizedCheckIn) {
            normalizedCheckOut.setDate(normalizedCheckOut.getDate() + 1);
        }

        const createData = {
            ...data,
            serviceStart: normalizedServiceStart,
            checkInTime: normalizedCheckIn,
            checkOutTime: normalizedCheckOut
        };

        const jobCard = await jobcartRepository.createJobCard(createData);

        //  Skip Matchmaking notifications if it's a Direct Assignment
        if (data.isDirectAssignWorker && data.assignedWorkerId) {
            console.log("Direct Assignment Job Card created. Skipping worker notifications.");
            await assignWorkerToJobCardService(jobCard._id, data.assignedWorkerId);
            return { jobCard, matchedWorkers: [] };
        }

        //  Socket Notification to matched workers (only for Matchmaking)
        const io = socketUtils.getIo();
        console.log(`[Socket] Sending notifications to ${matchedWorkers.length} matched workers...`);

        matchedWorkers.forEach(worker => {
            const workerId = worker._id.toString();
            console.log(`[Socket] Emitting 'new_job_alert' to worker room: ${workerId}`);

            io.to(workerId).emit("new_job_alert", {
                message: "New Job Match Found!",
                jobId: jobCard._id,
                serviceName: service.name,
                patientName: data.patientDetails.name,
                city: city
            });
        });

        //  FCM Push Notification to matched workers
        const fcmTokens = matchedWorkers
            .map(worker => worker.fcmToken)
            .filter(token => token && token.trim() !== "");

        if (fcmTokens.length > 0) {
            await sendFcmNotification(fcmTokens, {
                title: "New Job Alert! 📢",
                body: `New job for ${service.name} in ${city}. Tap to check details.`
            }, {
                jobId: jobCard._id.toString(),
                type: "incoming_call"
            });
        }
        return {
            jobCard,
            matchedWorkers
        }
    } catch (error) {
        throw error;
    }
}

const updateJobCardService = async (id, data) => {
    try {
        const jobCard = await jobcartRepository.getJobCardById(id);
        if (!jobCard) {
            throw new Error("Job card not found");
        }
        const updateData = { ...data };
        const baseDate = updateData.serviceStart ? normalizeDateOnly(updateData.serviceStart) : (jobCard.serviceStart || new Date());
        if (updateData.serviceStart) {
            updateData.serviceStart = baseDate;
        }
        if (updateData.checkInTime !== undefined) {
            updateData.checkInTime = normalizeTimeToDate(updateData.checkInTime, baseDate);
        }
        if (updateData.checkOutTime !== undefined) {
            updateData.checkOutTime = normalizeTimeToDate(updateData.checkOutTime, baseDate);
        }

        const checkIn = updateData.checkInTime !== undefined ? updateData.checkInTime : jobCard.checkInTime;
        const checkOut = updateData.checkOutTime !== undefined ? updateData.checkOutTime : jobCard.checkOutTime;

        if (checkIn && checkOut && checkOut < checkIn) {
            if (updateData.checkOutTime !== undefined) {
                updateData.checkOutTime.setDate(updateData.checkOutTime.getDate() + 1);
            } else {
                const newCheckOut = new Date(jobCard.checkOutTime);
                newCheckOut.setDate(newCheckOut.getDate() + 1);
                updateData.checkOutTime = newCheckOut;
            }
        }

        console.log(updateData, "updateData");
        const updatedJobCard = await jobcartRepository.updateJobCard(id, updateData);
        return updatedJobCard;
    } catch (error) {
        throw error;
    }
}

const addWorkerToJobCardService = async (jobCardId, workerId,) => {
    try {

        const jobCard = await jobcartRepository.getJobCardById(jobCardId);
        const worker = await workerRepository.getWorkerById(workerId);
        if (!jobCard) {
            throw new Error("Job card not found");
        }
        if (!worker) {
            throw new Error("Worker not found");
        }

        const safeJobCardId = typeof jobCardId === 'string' ? jobCardId.trim() : jobCardId;
        const safeWorkerId = typeof workerId === 'string' ? workerId.trim() : workerId;

        // Check if worker is already interested in this job card
        // NOTE: workers.interested is populated (Worker docs), so we compare _id not .worker
        const alreadyInterested = jobCard.workers.interested.some(
            (interest) => interest._id.toString() === safeWorkerId
        );
        if (alreadyInterested) {
            throw new Error("Worker is already interested in this job card");
        }
        // check worker if already busy (assigned to another job card)
        // getJobCardsByWorkerId returns an array, so we check isBusy directly on the worker document
        if (worker.isBusy) {
            throw new Error("You are already assigned to another job card");
        }

        const updatedJobCard = await jobcartRepository.addWorkerToJobCard(jobCardId, workerId);

        // 👑 Socket Notification to Admin
        const io = socketUtils.getIo();
        io.to("admin_room").emit("worker_interested", {
            message: `Worker ${worker.name} is interested in Job Card #${jobCardId}`,
            jobCardId: jobCardId,
            workerId: workerId,
            workerName: worker.name
        });

        return updatedJobCard;
    } catch (error) {
        throw error;
    }
}

const removeWorkerFromJobCardService = async (jobCardId, workerId) => {
    try {
        const jobCard = await jobcartRepository.getJobCardById(jobCardId);
        if (!jobCard) {
            throw new Error("Job card not found");
        }
        const updatedJobCard = await jobcartRepository.removeWorkerFromJobCard(jobCardId, workerId);

        // 👑 Socket Notification to Admin
        const io = socketUtils.getIo();
        io.to("admin_room").emit("worker_not_interested", {
            message: `Worker ID ${workerId} is no longer interested in Job Card #${jobCardId}`,
            jobCardId: jobCardId,
            workerId: workerId
        });

        return updatedJobCard;
    } catch (error) {
        throw error;
    }
}

const assignWorkerToJobCardService = async (jobCardId, workerId) => {
    try {
        const safeJobCardId = typeof jobCardId === 'string' ? jobCardId.trim() : jobCardId;
        const safeWorkerId = typeof workerId === 'string' ? workerId.trim() : workerId;
        const jobCard = await jobcartRepository.getJobCardById(safeJobCardId);

        if (!jobCard) {
            throw new Error("Job card not found");
        }
        if (jobCard.status === 'completed') {
            throw new Error("Cannot assign a worker to a completed job card");
        }

        const currentAssignedWorker = jobCard.workers?.assigned;
        const currentAssignedWorkerId = currentAssignedWorker?._id?.toString?.() || (typeof currentAssignedWorker === 'string' ? currentAssignedWorker : null);
        if (currentAssignedWorkerId === safeWorkerId) {
            return jobCard;
        }

        const isWorkerBusy = await workerRepository.checkWorkerBusyStatus(safeWorkerId);
        if (isWorkerBusy) {
            throw new Error("Worker is already busy to take another job, please select another worker");
        }

        const updatedJobCard = await jobcartRepository.assignWorkerToJobCard(safeJobCardId, new mongoose.Types.ObjectId(safeWorkerId));
        if (!updatedJobCard) {
            throw new Error("Failed to assign worker to job card");
        }

        if (currentAssignedWorkerId) {
            await workerRepository.updateWorker(currentAssignedWorkerId, { isBusy: false });
        }

        const assignedWorker = await workerRepository.getWorkerById(safeWorkerId);
        await workerRepository.updateWorker(safeWorkerId, { isBusy: true });
        await jobcartRepository.updateJobCard(safeJobCardId, { isAssigned: true, assignedAt: new Date() });

        const fullJobCard = await jobcartRepository.getJobCardById(safeJobCardId);
        const io = socketUtils.getIo();

        //  Notify Assigned Worker via Socket
        io.to(safeWorkerId).emit("job_assigned", {
            message: `Great news! You have been assigned to Job Card #${safeJobCardId}`,
            jobDetails: updatedJobCard.patientDetails,
            serviceDetails: updatedJobCard.serviceDetails,
            city: updatedJobCard.patientDetails.city,
        });

        // const userFCMToken = jobCard.user.fcmToken;


        // 📱 Notify Assigned Worker via FCM
        if (assignedWorker.fcmToken) {
            await sendFcmNotification(assignedWorker.fcmToken, {
                title: "🎉 Job Assigned!",
                body: `You have been assigned to Job Card #${safeJobCardId}. Check details in the app.`
            }, {
                jobId: safeJobCardId.toString(),
                type: "job_assigned"
            });
        }

        // 📄 PDF Generation & WhatsApp Notification Flow
        try {
            await ashineJobCardpdf(fullJobCard, assignedWorker, "assignment");

        } catch (pdfError) {
            console.error("Error in PDF/WhatsApp flow:", pdfError);
            // We don't throw here to avoid failing the assignment if notification fails
        }

        //  Automatic Rejection Logic for Other Workers
        const otherWorkers = jobCard.workers.interested.filter(worker => worker._id.toString() !== safeWorkerId);

        const otherWorkerFCMTokens = otherWorkers
            .map(worker => worker.fcmToken)
            .filter(token => token && token.trim() !== "");

        if (otherWorkerFCMTokens.length > 0) {
            console.log(`Sending rejection notifications to ${otherWorkerFCMTokens.length} workers`);
            await sendFcmNotification(otherWorkerFCMTokens, {
                title: "Job Rejected",
                body: "Thank you for showing interest! Unfortunately, this job has been assigned to another nurse. We will notify you whenever we find another match for you. Good luck!"
            }, {
                jobCardId: safeJobCardId.toString(),
                type: "job_rejected"
            });
        }

        // NOTE: otherWorkers elements are populated Worker documents, so we must use ._id
        otherWorkers.forEach(otherWorker => {
            io.to(otherWorker._id.toString()).emit("job_rejected", {
                message: "Thank you for showing interest! Unfortunately, this job has been assigned to another nurse. We will notify you whenever we find another match for you. Good luck!",
                jobCardId: safeJobCardId
            });
        });


        return updatedJobCard;
    } catch (error) {
        throw error;
    }
}

const deleteJobCardService = async (id) => {
    try {
        const jobCard = await jobcartRepository.deleteJobCard(id);
        return jobCard;
    } catch (error) {
        throw error;
    }
}

const getAllJobCardsService = async (query) => {
    try {
        const jobCards = await jobcartRepository.getAllJobCards(query);

        // Enhance with financial stats
        const enhancedJobCards = await Promise.all(jobCards.map(async (job) => {
            const latestPayment = await ClientRepository.getLatestClientPaymentByJobCardId(job._id);
            const totalPaid = (await ClientRepository.getClientPaymentsByJobCardId(job._id))
                .reduce((sum, p) => sum + p.amount, 0);

            const remainingAmount = latestPayment ? latestPayment.remainingAmount : 0;
            const isOverdue = latestPayment ? latestPayment.overLimit : false;

            const paidUntilDate = latestPayment ? latestPayment.paidUntilDate : null;
            let paymentValidity = 'invalid';
            if (paidUntilDate) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const validityDate = new Date(paidUntilDate);
                validityDate.setHours(0, 0, 0, 0);
                if (validityDate >= today) {
                    paymentValidity = 'valid';
                }
            }

            return {
                ...job._doc,
                financials: {
                    totalPaid,
                    remainingAmount,
                    availableBalance: latestPayment ? (latestPayment.availableBalance || 0) : 0,
                    isOverdue,
                    perDayCost: job.perDayCustomerCost || 0,
                    cycleDays: job.customerPaymentCycleDays || 7,
                    paidUntilDate,
                    paymentValidity
                }
            };
        }));

        return enhancedJobCards;
    } catch (error) {
        throw error;
    }
}

const getJobCardByIdService = async (id) => {
    try {
        const jobCard = await jobcartRepository.getJobCardById(id);
        return jobCard;
    } catch (error) {
        throw error;
    }
}

const getJobCardsByWorkerIdService = async (workerId) => {
    try {
        const safeWorkerId = typeof workerId === 'string' ? workerId.trim() : workerId;
        const jobCards = await jobcartRepository.getJobCardsByWorkerId(safeWorkerId);
        return jobCards;
    } catch (error) {
        throw error;
    }
}

const getJobCardsByStatusService = async (status, query = {}) => {
    try {
        const safeStatus = typeof status === 'string' ? status.trim() : status;
        const jobCards = await jobcartRepository.getJobCardsByStatus(safeStatus, query);
        return jobCards;
    } catch (error) {
        throw error;
    }
}

const getJobCardsByStatusAndWorkerIdService = async (status, workerId) => {
    try {
        const safeStatus = typeof status === 'string' ? status.trim() : status;
        const safeWorkerId = typeof workerId === 'string' ? workerId.trim() : workerId;
        const jobCards = await jobcartRepository.getJobCardsByStatusAndWorkerId(safeStatus, safeWorkerId);
        return jobCards;
    } catch (error) {
        throw error;
    }
}
const completeJobCardService = async (jobCardId) => {
    try {
        const safeJobCardId = typeof jobCardId === 'string' ? jobCardId.trim() : jobCardId;
        const jobCard = await jobcartRepository.getJobCardById(safeJobCardId);
        if (!jobCard) {
            throw new Error("Job card not found");
        }
        const updatedJobCard = await jobcartRepository.completeJobCard(safeJobCardId);
        const workerId = jobCard.workers?.assigned;

        if (workerId) {
            const worker = await workerRepository.getWorkerById(workerId);
            if (worker) {
                await workerRepository.updateWorker(workerId, { isBusy: false });
            }
        }
        return updatedJobCard;
    } catch (error) {
        throw error;
    }
}

const replaceWorkerInJobCardService = async (jobCardId, newWorkerId) => {
    try {
        const safeJobCardId = typeof jobCardId === 'string' ? jobCardId.trim() : jobCardId;
        const safeWorkerId = typeof newWorkerId === 'string' ? newWorkerId.trim() : newWorkerId;

        const jobCard = await jobcartRepository.getJobCardById(safeJobCardId);
        if (!jobCard) {
            throw new Error("Job card not found");
        }

        const currentlyAssigned = jobCard.workers?.assigned;
        const previouslyAssignedWorkerId = currentlyAssigned
            ? (typeof currentlyAssigned === 'string'
                ? currentlyAssigned
                : (currentlyAssigned._id ? currentlyAssigned._id.toString() : currentlyAssigned.toString()))
            : null;

        if (!previouslyAssignedWorkerId) {
            throw new Error("No worker is currently assigned to this job card");
        }

        if (previouslyAssignedWorkerId === safeWorkerId) {
            throw new Error("The selected worker is already assigned to this job card");
        }

        const isNewWorkerBusy = await workerRepository.checkWorkerBusyStatus(safeWorkerId);
        if (isNewWorkerBusy) {
            throw new Error("Worker is already busy to take another job, please select another worker");
        }

        const updatedJobCard = await jobcartRepository.updateJobCard(safeJobCardId, {
            'workers.assigned': new mongoose.Types.ObjectId(safeWorkerId),
            status: 'assigned',
            isAssigned: true,
            assignedAt: new Date(),
        });
        if (!updatedJobCard) {
            throw new Error("Failed to replace worker for this job card");
        }

        await workerRepository.updateWorker(previouslyAssignedWorkerId, { isBusy: false });
        await workerRepository.updateWorker(safeWorkerId, { isBusy: true });

        const assignedWorker = await workerRepository.getWorkerById(safeWorkerId);
        const fullJobCard = await jobcartRepository.getJobCardById(safeJobCardId);
        await ashineJobCardpdf(fullJobCard, assignedWorker, "replacement");

        const io = socketUtils.getIo();
        io.to(safeWorkerId).emit("job_assigned", {
            message: `You have been assigned to Job Card #${safeJobCardId} (Replacement)`,
            jobDetails: updatedJobCard.patientDetails,
            serviceDetails: updatedJobCard.serviceDetails,
            city: updatedJobCard.patientDetails.city,
        });
        io.to(previouslyAssignedWorkerId).emit("job_replaced", {
            message: `Your assignment on Job Card #${safeJobCardId} has been replaced`,
            jobDetails: updatedJobCard.patientDetails,
            serviceDetails: updatedJobCard.serviceDetails,
            city: updatedJobCard.patientDetails.city,
        });

        return updatedJobCard;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    createJobCardService,
    updateJobCardService,
    deleteJobCardService,
    getAllJobCardsService,
    getJobCardByIdService,
    addWorkerToJobCardService,
    removeWorkerFromJobCardService,
    assignWorkerToJobCardService,
    getJobCardsByWorkerIdService,
    getJobCardsByStatusService,
    getJobCardsByStatusAndWorkerIdService,
    completeJobCardService,
    replaceWorkerInJobCardService
}
