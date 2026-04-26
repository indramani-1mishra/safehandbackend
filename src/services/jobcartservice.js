const jobcartRepository = require("../repository/jobcartRepository");
const serviceRepository = require("../repository/serviceRepository");
const matchUsers = require("../utils/matchUsers");
const workerRepository = require("../repository/workerRepository");
const enquiryRepository = require("../repository/enqueryRepository");
const { default: mongoose } = require("mongoose");
const socketUtils = require("../utils/socket");
const { generatePdf } = require("../utils/pdfGenerator");
const { uploadPdfToS3 } = require("../utils/s3Upload");
const { sendWhatsappPdf } = require("../utils/sendWhatsappPdf");
const { sendWhatsappTemplatePdf } = require("../utils/sendWhatsappTemplatePdf");
const {
    generateWorkerPdfTemplate,
    generateClientPdfTemplate,
    generateAdminPdfTemplate
} = require("../utils/pdfTemplates");
const { DEFAULT_ADMIN_PHONE } = require("../config/serverConfig");
const { sendFcmNotification } = require("../utils/fcmService");

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


        const { plan = 'basic', duration = 1, timing = '12hr' } = data?.serviceDetails || {};

        //  Price Calculation Logic
        const cityPricing = service.pricingByCity?.find(p => p.city.toLowerCase() === city.toLowerCase());

        let finalCustomerPrice = 0;

        if (cityPricing) {
            const planKey = plan === 'advance' ? 'advance' : 'basic';
            const timingKey = timing === '24hr' ? 'hr24' : 'hr12';

            const pricePerDay = cityPricing[planKey] && cityPricing[planKey][timingKey] ? cityPricing[planKey][timingKey] : 0;

            const baseTotal = pricePerDay * duration;
            const addonsTotal = (data.addons || []).reduce((sum, addon) => sum + (Number(addon.price) || 0), 0);
            finalCustomerPrice = baseTotal + addonsTotal;
        } else {
            // Fallback to what frontend explicitly passed if pricing is missing for city
            finalCustomerPrice = data.totalDealAmount || 0;
        }

        // Update data object
        data.priceforCoustomer = finalCustomerPrice.toString();
        data.totalCalculatedPrice = finalCustomerPrice;

        // Placeholder for worker price
        data.priceforWorker = data.totalNurseSalary ? data.totalNurseSalary.toString() : (finalCustomerPrice * 0.7).toFixed(0).toString();

        const jobCard = await jobcartRepository.createJobCard(data);

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
        const updatedJobCard = await jobcartRepository.updateJobCard(id, data);
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

        if (jobCard.isAssigned) {
            throw new Error("Job card is already assigned");
        }
        const updatedJobCard = await jobcartRepository.assignWorkerToJobCard(safeJobCardId, new mongoose.Types.ObjectId(safeWorkerId));

        // Populate service details for PDF generation
        const fullJobCard = await jobcartRepository.getJobCardById(safeJobCardId);
        await fullJobCard.populate("serviceDetails.service");
        const assignedWorker = await workerRepository.getWorkerById(safeWorkerId);

        // Changed isBusy to isFree: false since isBusy doesn't exist by default in your model!
        await workerRepository.updateWorker(safeWorkerId, { isBusy: true });
        await jobcartRepository.updateJobCard(safeJobCardId, { isAssigned: true, assignedAt: new Date() });

        const io = socketUtils.getIo();

        // 🏆 Notify Assigned Worker via Socket
        io.to(safeWorkerId).emit("job_assigned", {
            message: `🎉 Great news! You have been assigned to Job Card #${safeJobCardId}`,
            jobDetails: updatedJobCard.patientDetails,
            serviceDetails: updatedJobCard.serviceDetails,
            city: updatedJobCard.patientDetails.city,
        });

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
            console.log("Generating PDFs for Worker, Client, and Admin...");

            // 1. Worker PDF
            const workerHtml = generateWorkerPdfTemplate(fullJobCard, assignedWorker);
            const workerPdfBuffer = await generatePdf(workerHtml);

            const workerPdfUrl = await uploadPdfToS3(workerPdfBuffer, `worker_jobcard_${safeJobCardId}.pdf`);
            console.log(workerPdfUrl);
            // Using template 'contract_message' for worker
            await sendWhatsappTemplatePdf(`91${assignedWorker.phone}`, workerPdfUrl, "Job_Assignment_Worker.pdf", assignedWorker.name, "en", safeJobCardId);

            // 2. Client PDF
            const clientHtml = generateClientPdfTemplate(fullJobCard, assignedWorker);
            const clientPdfBuffer = await generatePdf(clientHtml);
            const clientPdfUrl = await uploadPdfToS3(clientPdfBuffer, `client_jobcard_${safeJobCardId}.pdf`);
            // Using template 'contract_message' for client
            await sendWhatsappTemplatePdf(`91${fullJobCard.patientDetails.phone}`, clientPdfUrl, "Job_Assignment_Client.pdf", fullJobCard.patientDetails.name, "en", safeJobCardId);
            console.log(clientPdfUrl);
            // 3. Admin PDF
            const adminHtml = generateAdminPdfTemplate(fullJobCard, assignedWorker);
            const adminPdfBuffer = await generatePdf(adminHtml);

            const adminPdfUrl = await uploadPdfToS3(adminPdfBuffer, `admin_jobcard_${safeJobCardId}.pdf`);
            console.log(adminPdfUrl);
            if (DEFAULT_ADMIN_PHONE) {
                // Using template 'contract_message' for admin
                await sendWhatsappTemplatePdf(`91${DEFAULT_ADMIN_PHONE}`, adminPdfUrl, "Job_Assignment_Admin.pdf", "Admin", "en", safeJobCardId);
            }

            console.log("All assignment PDFs sent successfully.");
        } catch (pdfError) {
            console.error("Error in PDF/WhatsApp flow:", pdfError);
            // We don't throw here to avoid failing the assignment if notification fails
        }

        // 🧁 Automatic Rejection Logic for Other Workers
        const otherWorkers = jobCard.workers.interested.filter(id => id.toString() !== safeWorkerId);

        otherWorkers.forEach(otherWorkerId => {
            io.to(otherWorkerId.toString()).emit("job_rejected", {
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
        return jobCards;
    } catch (error) {
        throw error;
    }
}

const getJobCardByIdService = async (id) => {
    try {
        const jobCard = await jobcartRepository.getJobCardById(id);
        return jobCard;
    } catch (error) {
        throw error;;
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

const getJobCardsByStatusService = async (status) => {
    try {
        const safeStatus = typeof status === 'string' ? status.trim() : status;
        const jobCards = await jobcartRepository.getJobCardsByStatus(safeStatus);
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
        const workerId = jobCard.workers.assigned;

        const worker = await workerRepository.getWorkerById(workerId);

        if (!worker) {
            throw new Error("Worker not found");
        }
        await workerRepository.updateWorker(workerId, { isBusy: false });
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
    completeJobCardService
}
