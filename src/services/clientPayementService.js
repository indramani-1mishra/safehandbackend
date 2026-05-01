const ClientRepository = require("../repository/ClientRepository");
const JobCard = require("../modals/jobcartModel");
const ClientPayment = require("../modals/clientPayment");

/**
 * Helper to calculate inclusive days (Starts on 1st, Ends on 5th = 5 Days)
 * Using Midnight normalization to avoid hour/timezone issues.
 */


const createClientPayment = async (data) => {
    try {
        const { jobCardId, amount, paymentMethod } = data;

        const jobCard = await JobCard.findById(jobCardId);
        if (!jobCard) throw new Error("JobCard not found");

        // 1. Get the latest remaining balance
        const latestPayment = await ClientRepository.getLatestClientPaymentByJobCardId(jobCardId);
        const currentRemaining = latestPayment ? latestPayment.remainingAmount : 0;

        // 2. Calculate new remaining after payment
        const newRemainingAmount = currentRemaining - amount;

        // 3. Calculate days covered based on perDayCustomerCost
        const perDayAmount = jobCard.perDayCustomerCost || 0;
        const daysCovered = perDayAmount > 0 ? Math.floor(amount / perDayAmount) : 0;

        const clientPaymentData = {
            jobCardId,
            amount,
            remainingAmount: newRemainingAmount,
            dayCovered: daysCovered,
            paymentStatus: "paid",
            paymentMethod: paymentMethod || "cash",
            paymentDate: new Date(),
        };

        return await ClientRepository.createClientPayment(clientPaymentData);
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

module.exports = {
    createClientPayment,
    updateClientPayment,
    deleteClientPayment,
    getAllClientPayments,
    getClientPaymentById,
    getClientPaymentsByJobCardId,
    getClientwithreachlimit,
    getClientwithoverlimit,
    getTodayDuePayments
}
