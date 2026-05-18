const ClientRepository = require("../repository/ClientRepository");
const JobCard = require("../modals/jobcartModel");
const ClientPayment = require("../modals/clientPayment");
const { createInvoiceService } = require("./invoiceService");



const createClientPayment = async (data) => {
    try {
        const { jobCardId, amount, paymentMethod, proofUrl } = data;

        const jobCard = await JobCard.findById(jobCardId);
        if (!jobCard) throw new Error("JobCard not found");
        if (!proofUrl) throw new Error("Please upload a proof of payment");


        // 1. Get the latest status
        const latestPayment = await ClientRepository.getLatestClientPaymentByJobCardId(jobCardId);

        let currentAvailable = latestPayment ? (latestPayment.availableBalance || 0) : 0;
        let currentRemaining = latestPayment ? (latestPayment.remainingAmount || 0) : 0;

        // 2. Add payment to wallet first
        const totalAvailable = currentAvailable + Number(amount);
        const paymentToDebt = currentRemaining > 0 ? Math.min(totalAvailable, currentRemaining) : 0;
        const amountAfterDebt = totalAvailable - paymentToDebt;

        const perDayAmount = jobCard.perDayCustomerCost || 0;
        const daysCovered = perDayAmount > 0 ? Math.floor(amountAfterDebt / perDayAmount) : 0;
        const amountUsedForDays = daysCovered * perDayAmount;

        const finalRemaining = currentRemaining > totalAvailable ? currentRemaining - totalAvailable : 0;
        const finalAvailable = amountAfterDebt - amountUsedForDays;

        // Calculate paidFromDate and paidUntilDate from serviceStart
        const oldPaidUntilDate = latestPayment?.paidUntilDate;
        const serviceStartDate = jobCard.serviceStart || jobCard.inquiryId?.startDate || new Date();
        
        // Determine base date: if there's a previous paid period, continue from there, else start from serviceStart
        let paidFromDate;
        let paidUntilDate;
        
        if (oldPaidUntilDate && new Date(oldPaidUntilDate) > new Date()) {
            // Subsequent payment: continue from previous paid until date
            paidFromDate = new Date(oldPaidUntilDate);
            paidUntilDate = new Date(oldPaidUntilDate);
        } else {
            // First payment: start from service start date
            paidFromDate = new Date(serviceStartDate);
            paidUntilDate = new Date(serviceStartDate);
        }
        
        // Add covered days to calculate paidUntilDate
        paidUntilDate.setDate(paidUntilDate.getDate() + daysCovered);

        const clientPaymentData = {
            jobCardId,
            amount: Number(amount),
            remainingAmount: finalRemaining,
            remainingDays: perDayAmount > 0 ? Math.ceil(finalRemaining / perDayAmount) : 0,
            availableBalance: finalAvailable,
            dayCovered: daysCovered,
            paymentStatus: finalRemaining > 0 ? "pending" : "paid",
            paymentMethod: paymentMethod || "cash",
            paymentDate: new Date(),
            proofUrl: proofUrl || "",
            paidUntilDate: paidUntilDate,
            paidFromDate: paidFromDate,
        };


        const clientPayment = await ClientRepository.createClientPayment(clientPaymentData);
        await createInvoiceService({
            jobcard: jobCardId,
            clientPayment: clientPayment._id
        });
        return clientPayment;
    } catch (error) {
        throw error;
    }
}


const getTodayDuePayments = async () => {
    try {
        const ongoingJobs = await JobCard.find({ status: "assigned" });
        const dueClients = [];

        for (const job of ongoingJobs) {
            const latestPayment = await ClientRepository.getLatestClientPaymentByJobCardId(job._id);
            const remaining = latestPayment ? latestPayment.remainingAmount : 0;

            if (remaining > 0) {
                dueClients.push({
                    jobCardId: job._id,
                    patientName: job.patientDetails.name,
                    patientPhone: job.patientDetails.phone,
                    dueAmount: remaining,
                    lastUpdated: latestPayment ? latestPayment.paymentDate : new Date()
                });
            }
        }
        return dueClients;
    } catch (error) {
        throw error;
    }
}

const updateClientPayment = async (data) => {
    try {
        const { id, amount } = data;
        const existing = await ClientRepository.getClientPaymentById(id);
        const updateData = {
            amount: existing.amount + amount,
            remainingAmount: existing.remainingAmount - amount,
            paymentStatus: "paid",
            paymentDate: new Date()
        };
        return await ClientRepository.updateClientPayment(id, updateData);
    } catch (error) {
        throw error;
    }
}

const deleteClientPayment = async (id) => {
    try {
        return await ClientRepository.deleteClientPayment(id);
    } catch (error) {
        throw error;
    }
}

const getClientwithreachlimit = async () => {
    try {
        return await ClientRepository.getClientwithreachlimit();
    } catch (error) {
        throw error;
    }
}

const getClientwithoverlimit = async () => {
    try {
        return await ClientRepository.getClientwithoverlimit();
    } catch (error) {
        throw error;
    }
}

const getAllClientPayments = async (query) => {
    return await ClientRepository.getAllClientPayments(query);
}

const getClientPaymentById = async (id) => {
    return await ClientRepository.getClientPaymentById(id);
}

const getClientPaymentsByJobCardId = async (jobCardId) => {
    return await ClientRepository.getClientPaymentsByJobCardId(jobCardId);
}

const getReceivedPaymentByDate = async ({ startDate, endDate }) => {
    try {
        if (!startDate || !endDate) throw new Error("Start date and end date are required");
        return await ClientRepository.getReceivedPaymentByDate({ startDate, endDate });
    } catch (error) {
        throw error;
    }
}

const pendingClientRemainingAmountbydate = async ({ startDate, endDate }) => {
    try {
        if (!startDate || !endDate) throw new Error("Start date and end date are required");
        return await ClientRepository.pendingClientRemainingAmountbydate({ startDate, endDate });
    } catch (error) {
        throw error;
    }
}

module.exports = {
    createClientPayment,
    updateClientPayment,
    deleteClientPayment,
    getAllClientPayments,
    getClientPaymentById,
    getClientPaymentsByJobCardId,
    getClientwithreachlimit,
    getClientwithoverlimit,
    getTodayDuePayments,
    getReceivedPaymentByDate,
    pendingClientRemainingAmountbydate
}
