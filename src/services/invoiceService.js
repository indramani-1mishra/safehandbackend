const InvoiceRepository = require("../repository/invoiceRepository");
const JobCard = require("../modals/jobcartModel");
const ClientPayment = require("../modals/clientPayment");
const { generatePdf } = require("../utils/pdfGenerator");
const { generateServiceInvoiceTemplate } = require("../utils/serviceInvocetemplate");
//const { sendWhatsappPdf } = require("../utils/sendWhatsappPdf");
const { uploadPdfToS3 } = require("../utils/s3Upload");
const { sendWhatsappTemplatePdf } = require("../utils/sendWhatsappTemplatePdf");

const createInvoiceService = async (data) => {
    const { jobcard, clientPayment} = data;

    if (!jobcard) throw new Error("jobcard is required");
    if (!clientPayment) throw new Error("clientPayment is required");

    const jobCardExists = await JobCard.findById(jobcard);
    if (!jobCardExists) throw new Error("JobCard not found");

    const paymentExists = await ClientPayment.findById(clientPayment);
    if (!paymentExists) throw new Error("ClientPayment not found");

    const existingInvoice = await InvoiceRepository.getInvoiceByJobCardAndPayment(jobcard, clientPayment);
    if (existingInvoice) {
        throw new Error("Invoice already exists for this job card and payment");
    }

    const invoiceRecord = await InvoiceRepository.createInvoice({ jobcard, clientPayment, invoicepdf: "" });

    const paymentdetails = {
        _id: paymentExists._id,
        jobCardId: jobcard,
        amount: paymentExists.amount,
        paymentDate: paymentExists.paymentDate,
        createdAt: paymentExists.createdAt,
        paymentMethod: paymentExists.paymentMethod,
        paymentStatus: paymentExists.paymentStatus,
        remainingAmount: paymentExists.remainingAmount,
        paidFromDate: paymentExists.paidFromDate,
        proofUrl: paymentExists.proofUrl,
        clientName: jobCardExists.patientDetails?.name || jobCardExists.inquiryId?.patientName || "N/A",
        clientPhone: jobCardExists.patientDetails?.phone || jobCardExists.inquiryId?.patientPhone || "",
        clientAddress:
            jobCardExists.patientDetails?.address ||
            jobCardExists.inquiryId?.patientAddress ||
            jobCardExists.inquiryId?.address ||
            "",
        serviceName:
            (jobCardExists.serviceDetails?.service && jobCardExists.serviceDetails.service.name) ||
            jobCardExists.serviceDetails?.service ||
            "Healthcare Service",
        plan: jobCardExists.serviceDetails?.plan || "",
        timing: jobCardExists.serviceDetails?.timing || "",
        invoiceNumber: invoiceRecord.invoiceNumber
    };

    const html = generateServiceInvoiceTemplate(paymentdetails);
    const pdfBuffer = await generatePdf(html);
    const invoiceFileName = `Invoice_${paymentdetails.invoiceNumber || invoiceRecord._id}.pdf`;
    const invoicepdfurl = await uploadPdfToS3(pdfBuffer, invoiceFileName);
    console.log("Invoice PDF uploaded to S3 at URL:", invoicepdfurl);

    await InvoiceRepository.updateInvoice(invoiceRecord._id, { invoicepdf: invoicepdfurl });

    if (paymentdetails.clientPhone) {
        try {
            await sendWhatsappTemplatePdf(
                paymentdetails.clientPhone,
                invoicepdfurl,
                invoiceFileName,
                paymentdetails.clientName,
                "en",
                "invoice"
            );
            console.log("Invoice sent via WhatsApp to:", paymentdetails.clientPhone);
        } catch (whatsappError) {
            console.error("Failed to send invoice via WhatsApp:", whatsappError);
        }
    }

    return await InvoiceRepository.getInvoiceById(invoiceRecord._id);
};

const getAllInvoicesService = async (query) => {
    return await InvoiceRepository.getInvoices(query);
};

const getInvoiceByIdService = async (id) => {
    const invoice = await InvoiceRepository.getInvoiceById(id);
    if (!invoice) throw new Error("Invoice not found");
    return invoice;
};

const getInvoiceByInvoiceNumberService = async (invoiceNumber) => {
    const invoice = await InvoiceRepository.getInvoiceByInvoiceNumber(invoiceNumber);
    if (!invoice) throw new Error("Invoice not found");
    return invoice;
};

const getInvoicesByJobCardIdService = async (jobCardId) => {
    return await InvoiceRepository.getInvoicesByJobCardId(jobCardId);
};

const getInvoicesByClientPaymentIdService = async (clientPaymentId) => {
    return await InvoiceRepository.getInvoicesByClientPaymentId(clientPaymentId);
};

const updateInvoiceService = async (id, data) => {
    const invoice = await InvoiceRepository.updateInvoice(id, data);
    if (!invoice) throw new Error("Invoice not found or could not be updated");
    return invoice;
};

const deleteInvoiceService = async (id) => {
    const invoice = await InvoiceRepository.deleteInvoice(id);
    if (!invoice) throw new Error("Invoice not found or could not be deleted");
    return invoice;
};

module.exports = {
    createInvoiceService,
    getAllInvoicesService,
    getInvoiceByIdService,
    getInvoiceByInvoiceNumberService,
    getInvoicesByJobCardIdService,
    getInvoicesByClientPaymentIdService,
    updateInvoiceService,
    deleteInvoiceService
};
