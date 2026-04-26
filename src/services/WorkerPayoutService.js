const WorkerPayoutRepository = require("../repository/WorkerPayoutRepository");
const jobCardRepository = require("../repository/jobcartRepository");
const attendenceWorkerRepository = require("../repository/attendenceWorker");
const mongoose = require("mongoose");

/**
 * Worker requests a payout. Validates balance before creating a pending request.
 */
const requestPayoutService = async (data) => {
    try {
        const { workerId, jobCardId, amount } = data;

        if (!mongoose.Types.ObjectId.isValid(workerId) || !mongoose.Types.ObjectId.isValid(jobCardId)) {
            throw new Error("Invalid IDs provided");
        }

        const jobCard = await jobCardRepository.getJobCardById(jobCardId);
        if (!jobCard) throw new Error("Job card not found");

        // Calculate Total Earned (Present Days * Per Day Nurse Cost)
        const attendanceRecords = await attendenceWorkerRepository.getAttendanceByJobCardIdAndWorkerId(jobCardId, workerId);
        const presentDays = attendanceRecords.filter(att => att.status === "present").length;
        const perDayCost = jobCard.perDayNurseCost || 0;
        const totalEarned = presentDays * perDayCost;

        // Calculate Total already Paid or Pending (to prevent over-requesting)
        const existingPayouts = await WorkerPayoutRepository.getPayoutsByWorkerAndJob(workerId, jobCardId);
        const totalPayouts = existingPayouts.reduce((sum, p) => {
            if (p.status !== "failed") return sum + p.amount;
            return sum;
        }, 0);

        const balance = totalEarned - totalPayouts;
        if (amount > balance) {
            throw new Error(`Not enough balance. Your current available balance is ₹${balance}`);
        }

        const payoutRequest = await WorkerPayoutRepository.createWorkerPayout({
            workerId,
            jobCardId,
            amount,
            status: "pending",
            remarks: "Worker requested payment"
        });

        return {
            success: true,
            message: "Payout request sent successfully",
            data: payoutRequest,
            availableBalance: balance - amount
        };
    } catch (error) {
        throw new Error(error.message);
    }
};

/**
 * Get all pending requests for Admin
 */
const getPendingPayoutRequestsService = async () => {
    try {
        const allPayouts = await WorkerPayoutRepository.getAllPayouts();
        return {
            success: true,
            data: allPayouts.filter(p => p.status === "pending")
        };
    } catch (error) {
        throw new Error(error.message);
    }
};

/**
 * Legacy methods for other parts of the app (Dashboard etc.)
 */
const getWorkerPayoutDue = async (workerId, jobCardId) => {
    const jobCard = await jobCardRepository.getJobCardById(jobCardId);
    if (!jobCard) return { remainingDue: 0 };
    
    const attendance = await attendenceWorkerRepository.getAttendanceByJobCardIdAndWorkerId(jobCardId, workerId);
    const presentDays = attendance.filter(a => a.status === 'present').length;
    const totalEarned = presentDays * (jobCard.perDayNurseCost || 0);
    
    const payouts = await WorkerPayoutRepository.getPayoutsByWorkerAndJob(workerId, jobCardId);
    const totalPaid = payouts.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
    
    return {
        totalEarned,
        totalPaid,
        remainingDue: totalEarned - totalPaid
    };
};

const createWorkerPayoutService = async (data) => {
    return await WorkerPayoutRepository.createWorkerPayout(data);
};

const getWorkerBalanceService = async (workerId, jobCardId) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(workerId) || !mongoose.Types.ObjectId.isValid(jobCardId)) {
            throw new Error("Invalid IDs provided");
        }

        const jobCard = await jobCardRepository.getJobCardById(jobCardId);
        if (!jobCard) throw new Error("Job card not found");

        // 1. Calculate Total Earned (Present Days * Per Day Nurse Cost)
        const attendanceRecords = await attendenceWorkerRepository.getAttendanceByJobCardIdAndWorkerId(jobCardId, workerId);
        const presentDays = attendanceRecords.filter(att => att.status === "present").length;
        const perDayCost = jobCard.perDayNurseCost || 0;
        const totalEarned = presentDays * perDayCost;

        // 2. Calculate Total already Paid or Pending
        const existingPayouts = await WorkerPayoutRepository.getPayoutsByWorkerAndJob(workerId, jobCardId);
        
        const paidAmount = existingPayouts
            .filter(p => p.status === "paid")
            .reduce((sum, p) => sum + p.amount, 0);
            
        const pendingAmount = existingPayouts
            .filter(p => p.status === "pending")
            .reduce((sum, p) => sum + p.amount, 0);

        const totalDeductions = paidAmount + pendingAmount;
        const availableBalance = totalEarned - totalDeductions;

        return {
            success: true,
            data: {
                workerId,
                jobCardId,
                workerName: jobCard.workers.assigned?.name || "Worker",
                patientName: jobCard.patientDetails.name,
                perDayCost,
                presentDays,
                totalEarned,
                paidAmount,
                pendingAmount,
                availableBalance,
                paymentCycleDays: jobCard.nursePaymentCycleDays || 0,
                status: jobCard.status
            }
        };
    } catch (error) {
        throw new Error(error.message);
    }
};

const getWorkerHistoryService = async (workerId) => {
    return await WorkerPayoutRepository.getAllPayoutsByWorker(workerId);
};

const getAdminAllWorkersPayablesService = async (filters = {}) => {
    try {
        // 1. Get all assigned job cards
        const ongoingJobs = await jobCardRepository.getJobCardsByStatus("assigned");
        let summaryList = [];

        for (const job of ongoingJobs) {
            if (job.workers && job.workers.assigned) {
                const workerId = job.workers.assigned;
                const jobCardId = job._id;

                const balanceResult = await getWorkerBalanceService(workerId, jobCardId);
                if (balanceResult.success) {
                    summaryList.push(balanceResult.data);
                }
            }
        }

        // 2. Apply Dynamic Filters
        if (filters.hasPendingRequest === 'true') {
            summaryList = summaryList.filter(item => item.pendingAmount > 0);
        }

        if (filters.minBalance) {
            summaryList = summaryList.filter(item => item.availableBalance >= Number(filters.minBalance));
        }

        if (filters.cycleOverdue === 'true') {
            summaryList = summaryList.filter(item => {
                // If balance is enough to cover at least one full cycle
                const cycleAmount = item.paymentCycleDays * item.perDayCost;
                return item.availableBalance >= cycleAmount && cycleAmount > 0;
            });
        }

        // 3. Calculate Global Stats for the filtered list
        const totalAvailableToPay = summaryList.reduce((sum, item) => sum + item.availableBalance, 0);
        const totalPendingFromWorkers = summaryList.reduce((sum, item) => sum + item.pendingAmount, 0);

        return {
            success: true,
            count: summaryList.length,
            summaryStats: {
                totalToPayToday: totalAvailableToPay,
                totalPendingRequests: totalPendingFromWorkers
            },
            data: summaryList
        };
    } catch (error) {
        throw new Error(error.message);
    }
};

const approvePayoutRequestService = async (payoutId, updateData) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(payoutId)) {
            throw new Error("Invalid Payout ID");
        }

        const payout = await WorkerPayoutRepository.getPayoutById(payoutId);
        if (!payout) throw new Error("Payout request not found");
        if (payout.status !== "pending") throw new Error(`Payout is already ${payout.status}`);

        const { paymentMethod, transactionId, remarks, paidFromDate, paidUntilDate } = updateData;

        const updatedPayout = await WorkerPayoutRepository.updateWorkerPayout(payoutId, {
            paymentMethod,
            transactionId,
            remarks,
            paidFromDate,
            paidUntilDate,
            status: "paid",
            payoutDate: new Date()
        });

        return {
            success: true,
            message: "Payout approved and marked as paid",
            data: updatedPayout
        };
    } catch (error) {
        throw new Error(error.message);
    }
};

const getPaidPayoutsService = async () => {
    try {
        const allPayouts = await WorkerPayoutRepository.getAllPayouts();
        return {
            success: true,
            data: allPayouts.filter(p => p.status === "paid")
        };
    } catch (error) {
        throw new Error(error.message);
    }
};

module.exports = {
    requestPayoutService,
    getPendingPayoutRequestsService,
    getWorkerPayoutDue,
    createWorkerPayoutService,
    getWorkerHistoryService,
    getWorkerBalanceService,
    getAdminAllWorkersPayablesService,
    approvePayoutRequestService,
    getPaidPayoutsService
};
