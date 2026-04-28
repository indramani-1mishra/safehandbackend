const ClientRepository = require("../repository/ClientRepository");
const JobCard = require("../modals/jobcartModel");
const ClientPayment = require("../modals/clientPayment");

/**
 * Helper to calculate inclusive days (Starts on 1st, Ends on 5th = 5 Days)
 * Using Midnight normalization to avoid hour/timezone issues.
 */
const calculateDaysInclusive = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Normalize to midnight to avoid hour differences (AM/PM)
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays + 1; // +1 to make it inclusive (e.g. 1st to 1st = 1 day)
};

const createClientPayment = async (data) => {
    try {
        const { jobCardId, amount, paymentMethod } = data;

        const jobCard = await JobCard.findById(jobCardId);
        if (!jobCard) throw new Error("JobCard not found");

        // Fetch all previous payments to calculate cumulative coverage
        const allPayments = await ClientRepository.getClientPaymentsByJobCardId(jobCardId);
        const totalPaidSoFar = allPayments.reduce((sum, p) => sum + p.amount, 0);

        const totalAmount = jobCard.totalDealAmount;
        const newTotalPaid = totalPaidSoFar + amount;

        // 1. Total Days calculate karein (Inclusive)
        const totalDuration = calculateDaysInclusive(jobCard.serviceStart, jobCard.serviceEnd);

        // 2. Per Day Cost safe calculation
        const perDayAmount = totalAmount / (totalDuration || 1);

        // 3. Aaj tak total kitne din cover hue
        const totalDaysCovered = Math.floor(newTotalPaid / perDayAmount);

        // 4. Paid Until Date calculation (Inclusive)
        // Starts from serviceStart and adds (daysCovered - 1)
        const paidUntilDate = new Date(jobCard.serviceStart);
        paidUntilDate.setDate(paidUntilDate.getDate() + totalDaysCovered - 1);
        paidUntilDate.setHours(23, 59, 59, 999); // Set to end of day for clear comparison

        // Limit Check logic
        const today = new Date();
        const overLimit = today > paidUntilDate;
        // Reach limit if only 1 day is left in the current paid cycle
        const reachLimit = Math.abs(paidUntilDate - today) <= (1000 * 60 * 60 * 24);

        const clientPaymentData = {
            jobCardId,
            amount,
            remainingAmount: Math.max(0, totalAmount - newTotalPaid),
            dayCovered: Math.floor(amount / (perDayAmount || 1)),
            remainingDays: Math.max(0, totalDuration - totalDaysCovered),
            paidUntilDate,
            overLimit,
            reachLimit,
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
        // Status 'assigned' covers ongoing jobs that have workers assigned
        const ongoingJobs = await JobCard.find({ status: "assigned" });
        const dueClients = [];

        for (const job of ongoingJobs) {
            const allPayments = await ClientRepository.getClientPaymentsByJobCardId(job._id);
            const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);

            const totalDuration = calculateDaysInclusive(job.serviceStart, job.serviceEnd);
            const perDayAmount = job.totalDealAmount / (totalDuration || 1);

            // Days actual passed since start (Inclusive)
            const daysPassed = calculateDaysInclusive(job.serviceStart, new Date());
            const shouldHavePaid = Math.min(daysPassed * perDayAmount, job.totalDealAmount);

            if (totalPaid < shouldHavePaid) {
                // Find latest paidUntilDate for information
                const latestPayment = allPayments.sort((a, b) => b.paidUntilDate - a.paidUntilDate)[0];

                dueClients.push({
                    jobCardId: job._id,
                    patientName: job.patientDetails.name,
                    totalDeal: job.totalDealAmount,
                    totalPaid: totalPaid,
                    dueAmount: Math.ceil(shouldHavePaid - totalPaid),
                    lastPaidUntil: latestPayment ? latestPayment.paidUntilDate : job.serviceStart,
                    daysUnpaid: daysPassed - Math.floor(totalPaid / perDayAmount)
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
