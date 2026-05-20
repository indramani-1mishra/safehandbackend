const { generatePdf } = require("./pdfGenerator");
const { uploadPdfToS3 } = require("./s3Upload");
const { sendPdfonwhatsapp } = require("./sendjobassignment");
const jobCardRepository = require("../repository/jobcartRepository");

const {
    generateWorkerPdfTemplate,
    generateClientPdfTemplate,
    generateAdminPdfTemplate,
} = require("./pdfTemplates");

const { DEFAULT_ADMIN_PHONE } = require("../config/serverConfig");


const sendTemplatePdfIfPhone = async (
    phone,
    url,
    recipientName,
    serviceName,
    filename,
    templateName
) => {

    if (!phone) {
        console.warn(
            `Skipping PDF send for ${recipientName} because phone number is missing.`
        );
        return;
    }

    try {

        // Ensure only clean strings go to WhatsApp template
        const cleanRecipientName = String(
            recipientName || "User"
        )
            .replace(/\n|\t/g, " ")
            .trim();

        const cleanServiceName =
            typeof serviceName === "object"
                ? String(serviceName?.name || "Care Service")
                : String(serviceName || "Care Service");

        await sendPdfonwhatsapp(
            phone,
            url,
            cleanRecipientName,
            cleanServiceName,
            filename,
            templateName
        );

    } catch (sendError) {

        console.error(
            `Failed to send PDF to ${recipientName}:`,
            sendError
        );
    }
};


// ===============================
// MAIN FUNCTION
// ===============================
const ashineJobCardpdf = async (
    jobCard,
    assignedWorker,
    mode = "assignment"
) => {

    try {



        const safeJobCardId = jobCard._id
            .toString()
            .replace(/[^a-zA-Z0-9]/g, "_");

        const fullJobCard = await jobCardRepository.getJobCardById(
            jobCard._id
        );

        // Get proper service name
        const serviceName =
            fullJobCard?.serviceDetails?.service?.name ||
            "Care Giving Service";



        // =========================================
        // 1. WORKER PDF
        // =========================================
        const workerHtml = generateWorkerPdfTemplate(
            fullJobCard,
            assignedWorker,
            mode
        );

        const workerPdfBuffer = await generatePdf(workerHtml);

        const workerPdfUrl = await uploadPdfToS3(
            workerPdfBuffer,
            `worker_jobcard_${safeJobCardId}.pdf`
        );



        await sendTemplatePdfIfPhone(
            assignedWorker.phone,
            workerPdfUrl,
            assignedWorker.name,
            serviceName,
            `worker_jobcard_${assignedWorker.name}.pdf`,
            "worker_assignment_pdf"
        );



        // =========================================
        // 2. CLIENT PDF
        // =========================================
        const clientHtml = generateClientPdfTemplate(
            fullJobCard,
            assignedWorker,
            mode
        );

        const clientPdfBuffer = await generatePdf(clientHtml);

        const clientPdfUrl = await uploadPdfToS3(
            clientPdfBuffer,
            `client_jobcard_${safeJobCardId}.pdf`
        );



        await sendTemplatePdfIfPhone(
            fullJobCard.patientDetails?.phone,
            clientPdfUrl,
            fullJobCard.patientDetails?.name || "Client",
            serviceName,
            `client_jobcard_${fullJobCard.patientDetails?.name || "Client"}.pdf`,
            "client_assignment_pdf"
        );




        // =========================================
        // 3. ADMIN PDF
        // =========================================
        const adminHtml = generateAdminPdfTemplate(
            fullJobCard,
            assignedWorker,
            mode
        );

        const adminPdfBuffer = await generatePdf(adminHtml);

        const adminPdfUrl = await uploadPdfToS3(
            adminPdfBuffer,
            `admin_jobcard_${safeJobCardId}.pdf`
        );

        if (DEFAULT_ADMIN_PHONE) {

            await sendTemplatePdfIfPhone(
                DEFAULT_ADMIN_PHONE,
                adminPdfUrl,
                "Admin",
                serviceName,
                `admin_jobcard_${assignedWorker.name}.pdf`,
                "admin_assignment_pdf"
            );

        } else {

            console.warn(
                "DEFAULT_ADMIN_PHONE is not configured. Skipping admin PDF send."
            );
        }



    } catch (pdfError) {

        console.error(
            "Error in PDF/WhatsApp flow:",
            pdfError
        );
    }
};


module.exports = ashineJobCardpdf;