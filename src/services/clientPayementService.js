const ClientRepository = require("../repository/ClientRepository");
const JobCard = require("../modals/jobcartModel");
const ClientPayment = require("../modals/clientPayment");
const { createInvoiceService } = require("./invoiceService");



const createClientPayment = async (data) => {
    try {
        const { jobCardId, amount, paymentMethod, proofUrl } = data;

        const jobCard = await JobCard.findById(jobCardId);

        if (!jobCard) {
            throw new Error("JobCard not found");
        }

        if (!proofUrl) {
            throw new Error("Please upload a proof of payment");
        }

        // Get latest payment status
        const latestPayment =
            await ClientRepository.getLatestClientPaymentByJobCardId(jobCardId);

        // Previous balances
        const currentAvailable =
            latestPayment?.availableBalance || 0;

        const currentRemaining =
            latestPayment?.remainingAmount || 0;

        // Add new payment to wallet
        const totalAvailable =
            currentAvailable + Number(amount);

        // Clear previous debt first
        const paymentToDebt =
            currentRemaining > 0
                ? Math.min(totalAvailable, currentRemaining)
                : 0;

        // Remaining amount after debt clearance
        const amountAfterDebt =
            totalAvailable - paymentToDebt;

        // Per day cost
        const perDayAmount =
            jobCard.perDayCustomerCost || 0;

        // Calculate service days covered
        const daysCovered =
            perDayAmount > 0
                ? Math.floor(amountAfterDebt / perDayAmount)
                : 0;

        // Money used for covered days
        const amountUsedForDays =
            daysCovered * perDayAmount;

        // Remaining due amount
        const finalRemaining =
            currentRemaining > totalAvailable
                ? currentRemaining - totalAvailable
                : 0;

        // Remaining wallet balance
        const finalAvailable =
            amountAfterDebt - amountUsedForDays;

        // Service start date
        const serviceStartDate = new Date(
            jobCard.serviceStart ||
            jobCard.inquiryId?.startDate ||
            new Date()
        );

        // Previous paid until date
        const previousPaidUntil =
            latestPayment?.paidUntilDate
                ? new Date(latestPayment.paidUntilDate)
                : null;

        // Determine payment start date
        let paidFromDate;

        if (previousPaidUntil) {
            paidFromDate = new Date(previousPaidUntil);

            // Start from next day after previous payment end
            paidFromDate.setDate(
                paidFromDate.getDate() + 1
            );
        } else {
            paidFromDate = new Date(serviceStartDate);
        }

        // Calculate paid until date
        const paidUntilDate = new Date(paidFromDate);

        if (daysCovered > 0) {
            paidUntilDate.setDate(
                paidUntilDate.getDate() + (daysCovered - 1)
            );
        }

        // Payment status
        const paymentStatus =
            finalRemaining > 0 ? "pending" : "paid";

        // Create payment object
        const clientPaymentData = {
            jobCardId,

            amount: Number(amount),

            remainingAmount: finalRemaining,

            remainingDays:
                perDayAmount > 0
                    ? Math.ceil(finalRemaining / perDayAmount)
                    : 0,

            availableBalance: finalAvailable,

            dayCovered: daysCovered,

            paymentStatus,

            paymentMethod: paymentMethod || "cash",

            paymentDate: new Date(),

            proofUrl: proofUrl || "",

            paidFromDate,

            paidUntilDate,
        };

        // Save payment
        const clientPayment =
            await ClientRepository.createClientPayment(
                clientPaymentData
            );

        // Generate invoice
        await createInvoiceService({
            jobcard: jobCardId,
            clientPayment: clientPayment._id
        });

        return clientPayment;

    } catch (error) {
        throw error;
    }
};

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
