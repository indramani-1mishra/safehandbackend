const ClientRepository = require("../repository/ClientRepository");
const JobCard = require("../modals/jobcartModel");
const ClientPayment = require("../modals/clientPayment");



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
        let totalAvailable = currentAvailable + Number(amount);
        let finalRemaining = currentRemaining;
        let finalAvailable = totalAvailable;

        // 3. Automatically use wallet to pay off existing debt
        if (currentRemaining > 0) {
            if (totalAvailable >= currentRemaining) {
                finalAvailable = totalAvailable - currentRemaining;
                finalRemaining = 0;
            } else {
                finalRemaining = currentRemaining - totalAvailable;
                finalAvailable = 0;
            }
        }

        const perDayAmount = jobCard.perDayCustomerCost || 0;
        const daysCovered = perDayAmount > 0 ? Math.floor(amount / perDayAmount) : 0;

        const clientPaymentData = {
            jobCardId,
            amount,
            remainingAmount: finalRemaining,
            availableBalance: finalAvailable,
            dayCovered: daysCovered,
            paymentStatus: "paid",
            paymentMethod: paymentMethod || "cash",
            paymentDate: new Date(),
            proofUrl: proofUrl || "",

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
