const { generatePdf } = require("./pdfGenerator");
const { uploadPdfToS3 } = require("./s3Upload");
const { sendWhatsappTemplatePdf } = require("./sendWhatsappTemplatePdf");
const jobCardRepository = require("../repository/jobcartRepository");
const { generateWorkerPdfTemplate, generateClientPdfTemplate, generateAdminPdfTemplate } = require("./pdfTemplates");
const { DEFAULT_ADMIN_PHONE } = require("../config/serverConfig");


const ashineJobCardpdf = async (jobCard, assignedWorker, mode = "assignment") => {
    try {
        console.log("Generating PDFs for Worker, Client, and Admin...");

        const isReplacement = mode === "replacement";
        const safeJobCardId = jobCard._id
            .toString()
            .replace(/[^a-zA-Z0-9]/g, "_");
        const whatsappTemplateName = "ashind_template";
        const whatsappButtonValue = safeJobCardId;

        const fullJobCard = await jobCardRepository.getJobCardById(jobCard._id);

        // 1. Worker PDF
        const workerHtml = generateWorkerPdfTemplate(fullJobCard, assignedWorker, mode);
        const workerPdfBuffer = await generatePdf(workerHtml);

        const workerPdfUrl = await uploadPdfToS3(
            workerPdfBuffer,
            `worker_jobcard_${safeJobCardId}.pdf`
        );

        console.log(workerPdfUrl);

        await sendWhatsappTemplatePdf(
            `91${assignedWorker.phone}`,
            workerPdfUrl,
            isReplacement ? "Job_Replacement_Worker.pdf" : "Job_Assignment_Worker.pdf",
            assignedWorker.name,
            "en",
            whatsappButtonValue,
            whatsappTemplateName,
            isReplacement
                ? `Hello ${assignedWorker.name}, your worker assignment has been updated for Job #${jobCard._id}. Please review the attached details.`
                : `Hello ${assignedWorker.name}, you have been assigned a new job. Please review the attached details.`
        );

        // 2. Client PDF
        const clientHtml = generateClientPdfTemplate(fullJobCard, assignedWorker, mode);

        const clientPdfBuffer = await generatePdf(clientHtml);

        const clientPdfUrl = await uploadPdfToS3(
            clientPdfBuffer,
            `client_jobcard_${safeJobCardId}.pdf`
        );

        console.log(clientPdfUrl);

        await sendWhatsappTemplatePdf(
            `91${fullJobCard.patientDetails.phone}`,
            clientPdfUrl,
            isReplacement ? "Job_Replacement_Client.pdf" : "Job_Assignment_Client.pdf",
            fullJobCard.patientDetails.name,
            "en",
            whatsappButtonValue,
            whatsappTemplateName,
            isReplacement
                ? `Hello ${fullJobCard.patientDetails.name}, your caregiver has been replaced for Job #${jobCard._id}. Please review the updated assignment details.`
                : `Hello ${fullJobCard.patientDetails.name}, your caregiver assignment details are attached.`
        );

        // 3. Admin PDF
        const adminHtml = generateAdminPdfTemplate(fullJobCard, assignedWorker, mode);

        const adminPdfBuffer = await generatePdf(adminHtml);

        const adminPdfUrl = await uploadPdfToS3(
            adminPdfBuffer,
            `admin_jobcard_${safeJobCardId}.pdf`
        );

        console.log(adminPdfUrl);

        if (DEFAULT_ADMIN_PHONE) {
            await sendWhatsappTemplatePdf(
                `91${DEFAULT_ADMIN_PHONE}`,
                adminPdfUrl,
                isReplacement ? "Job_Replacement_Admin.pdf" : "Job_Assignment_Admin.pdf",
                "Admin",
                "en",
                whatsappButtonValue,
                whatsappTemplateName,
                isReplacement
                    ? `Hello Admin, a replacement worker has been assigned for Job #${jobCard._id}. Please review the updated assignment.`
                    : `Hello Admin, a worker has been assigned for Job #${jobCard._id}. Please review the assignment details.`
            );
        }

        console.log("All assignment PDFs sent successfully.");
    } catch (pdfError) {
        console.error("Error in PDF/WhatsApp flow:", pdfError);
    }
};

module.exports = ashineJobCardpdf;