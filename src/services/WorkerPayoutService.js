const WorkerPayoutRepository = require("../repository/WorkerPayoutRepository");
const jobCardRepository = require("../repository/jobcartRepository");
const attendenceWorkerRepository = require("../repository/attendenceWorker");
const workerRepository = require("../repository/workerRepository");
const mongoose = require("mongoose");
const { sendFcmNotification } = require("../utils/fcmService");
const JobCard = require("../modals/jobcartModel");
const Attendance = require("../modals/attendanceModel");
const WorkerPayout = require("../modals/Workerpayeout");
const WorkerTransactionHistoryRepository = require("../repository/WorkerTransactionHistoryRepo");

/**
 * Recalculates the worker's global available balance across all jobs and updates the Worker document in MongoDB.
 */
const updateWorkerGlobalBalance = async (workerId) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(workerId)) {
            throw new Error("Invalid Worker ID");
        }

        const workerObjectId = new mongoose.Types.ObjectId(workerId);

        const jobCardIds = new Set();

        const assignedJobs = await JobCard.find({ "workers.assigned": workerObjectId });
        assignedJobs.forEach(job => jobCardIds.add(job._id.toString()));

        const attendanceRecords = await Attendance.find({ workerId: workerObjectId });
        attendanceRecords.forEach(att => jobCardIds.add(att.jobCardId.toString()));

        const payouts = await WorkerPayout.find({ workerId: workerObjectId });
        payouts.forEach(p => jobCardIds.add(p.jobCardId.toString()));

        // 2. Calculate Total Earned across all these job cards
        let totalEarned = 0;
        for (const jobCardId of jobCardIds) {
            const jobCard = await JobCard.findById(jobCardId);
            if (!jobCard) continue;

            const jobAttendance = attendanceRecords.filter(
                att => att.jobCardId.toString() === jobCardId && att.status === "present"
            );
            for (const att of jobAttendance) {
                if (att.todaySalary !== undefined && att.todaySalary !== null) {
                    totalEarned += att.todaySalary;
                } else {
                    totalEarned += jobCard.perDayNurseCost || 0;
                }
            }
        }

        // 3. Calculate Total already Paid or Pending payouts across all jobs
        const totalPayouts = payouts
            .filter(p => p.status !== "failed" && p.status !== "rejected")
            .reduce((sum, p) => sum + p.amount, 0);

        const globalAvailableBalance = totalEarned - totalPayouts;

        // 4. Update the Worker record in database
        await workerRepository.updateWorker(workerId, { availableBalance: globalAvailableBalance });

        return globalAvailableBalance;
    } catch (error) {
        console.error("Error updating worker global balance:", error);
        throw error;
    }
};

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
        const presentAttendance = attendanceRecords.filter(att => att.status === "present");
        let totalEarned = 0;
        for (const att of presentAttendance) {
            if (att.todaySalary !== undefined && att.todaySalary !== null) {
                totalEarned += att.todaySalary;
            } else {
                totalEarned += jobCard.perDayNurseCost || 0;
            }
        }
        // Calculate Total already Paid or Pending (to prevent over-requesting)
        const existingPayouts = await WorkerPayoutRepository.getPayoutsByWorkerAndJob(workerId, jobCardId);
        const totalPayouts = existingPayouts.reduce((sum, p) => {
            if (p.status !== "failed" && p.status !== "rejected") return sum + p.amount;
            return sum;
        }, 0);

        const balance = totalEarned - totalPayouts;
        const maxRequestable = balance * 0.25;
        if (amount > maxRequestable) {
            throw new Error(`You can request a maximum of 25% of your available balance (max: ₹${maxRequestable.toFixed(2)}). Your current available balance is ₹${balance}`);
        }

        const payoutRequest = await WorkerPayoutRepository.createWorkerPayout({
            workerId,
            jobCardId,
            amount,
            status: "pending",
            remarks: "Worker requested payment"
        });

        // Recalculate and update the worker's global available balance in MongoDB
        await updateWorkerGlobalBalance(workerId);

        const worker = await workerRepository.getWorkerById(workerId);
        const workerDevice = worker?.fcmToken;
        const patientName = jobCard?.patientDetails?.name || "your job";

        if (workerDevice) {
            await sendFcmNotification(workerDevice, {
                title: "Payout Request Submitted 💰",
                body: `Your payout request of ₹${amount} for ${patientName}'s job has been submitted for review.`,
            }, {
                type: "payout_requested",
                jobCardId: jobCardId.toString(),
                payoutId: payoutRequest._id.toString()
            });
        }

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
    const presentAttendance = attendance.filter(a => a.status === 'present');
    let totalEarned = 0;
    for (const att of presentAttendance) {
        if (att.todaySalary !== undefined && att.todaySalary !== null) {
            totalEarned += att.todaySalary;
        } else {
            totalEarned += jobCard.perDayNurseCost || 0;
        }
    }

    const payouts = await WorkerPayoutRepository.getPayoutsByWorkerAndJob(workerId, jobCardId);
    const totalPaid = payouts.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);

    return {
        totalEarned,
        totalPaid,
        remainingDue: totalEarned - totalPaid
    };
};

const createWorkerPayoutService = async (data) => {
    const worker = await workerRepository.getWorkerById(data.workerId);
    if (!worker) {
        throw new Error("Worker not found");
    }
    const amountVal = Number(data.amount) || 0;
    const deductionVal = Number(data.deductionAmount) || 0;

    if (worker.availableBalance < amountVal) {
        throw new Error("Insufficient balance");
    }
    const jobCard = await jobCardRepository.getJobCardById(data.jobCardId);
    if (!jobCard) {
        throw new Error("Job card not found");
    }

    const payoutData = {
        ...data,
        amount: amountVal,
        deductionAmount: deductionVal,
        deductionReason: data.deductionReason || "",
        status: data.status || "paid"
    };

    const payout = await WorkerPayoutRepository.createWorkerPayout(payoutData);

    if (data.workerId) {
        await updateWorkerGlobalBalance(data.workerId);

        // Fetch updated balance to store correct running balance
        const updatedWorker = await workerRepository.getWorkerById(data.workerId);

        if (payout.status === "paid") {
            let transactionRemarks = data.remarks || "Worker Payout";
            if (payout.deductionAmount > 0) {
                transactionRemarks += ` (Deduction: ₹${payout.deductionAmount} - Reason: ${payout.deductionReason || 'Fine/Recovery'})`;
            }
            const transactionData = {
                workerId: data.workerId,
                jobCardId: data.jobCardId,
                payoutId: payout._id,
                amount: payout.amount,
                status: "debited",
                remarks: transactionRemarks,
                transactionType: "paid_payout",
                balanceAfterTransaction: updatedWorker.availableBalance
            };
            await WorkerTransactionHistoryRepository.createTransaction(transactionData);
        }
    }
    return payout;
};

const getWorkerBalanceService = async (workerId, jobCardId, options = {}) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(workerId) || !mongoose.Types.ObjectId.isValid(jobCardId)) {
            throw new Error("Invalid IDs provided");
        }

        const jobCard = await jobCardRepository.getJobCardById(jobCardId);
        if (!jobCard) throw new Error("Job card not found");

        // 1. Calculate Total Earned
        const attendanceRecords = await attendenceWorkerRepository.getAttendanceByJobCardIdAndWorkerId(jobCardId, workerId);
        
        let filteredAttendance = attendanceRecords;
        if (options.startDate) {
            filteredAttendance = filteredAttendance.filter(att => att.date >= options.startDate);
        }
        if (options.endDate) {
            filteredAttendance = filteredAttendance.filter(att => att.date <= options.endDate);
        }

        const presentAttendance = filteredAttendance.filter(att => att.status === "present");
        const presentDays = presentAttendance.length;
        const perDayCost = jobCard.perDayNurseCost || 0;
        let totalEarned = 0;
        for (const att of presentAttendance) {
            if (att.todaySalary !== undefined && att.todaySalary !== null) {
                totalEarned += att.todaySalary;
            } else {
                totalEarned += perDayCost;
            }
        }

        // 2. Calculate Total already Paid or Pending
        const existingPayouts = await WorkerPayoutRepository.getPayoutsByWorkerAndJob(workerId, jobCardId);

        let filteredPayouts = existingPayouts;
        if (options.rawStartDate) {
            filteredPayouts = filteredPayouts.filter(p => new Date(p.payoutDate || p.createdAt) >= options.rawStartDate);
        }
        if (options.rawEndDate) {
            filteredPayouts = filteredPayouts.filter(p => new Date(p.payoutDate || p.createdAt) <= options.rawEndDate);
        }

        const paidAmount = filteredPayouts
            .filter(p => p.status === "paid")
            .reduce((sum, p) => sum + p.amount, 0);

        const pendingAmount = filteredPayouts
            .filter(p => p.status === "pending")
            .reduce((sum, p) => sum + p.amount, 0);

        const totalDeductions = paidAmount + pendingAmount;
        const availableBalance = totalEarned - totalDeductions;

        // Recalculate and update the worker's global available balance in MongoDB
        const globalAvailableBalance = await updateWorkerGlobalBalance(workerId);

        const worker = await workerRepository.getWorkerById(workerId);
        const workerName = worker ? worker.name : (jobCard.workers.assigned?.name || "Worker");

        return {
            success: true,
            data: {
                workerId,
                jobCardId,
                workerName,
                patientName: jobCard.patientDetails.name,
                perDayCost,
                presentDays,
                totalEarned,
                paidAmount,
                pendingAmount,
                availableBalance,
                globalAvailableBalance,
                paymentCycleDays: jobCard.nursePaymentCycleDays || 0,
                status: jobCard.status
            }
        };
    } catch (error) {
        throw new Error(error.message);
    }
};

// for temprory use 
const getWorkerHistoryService = async (workerId) => {
    try {
        // 1. Fetch payouts (decrease balance)
        const payouts = await WorkerPayout.find({ workerId })
            .populate("jobCardId")
            .sort({ createdAt: -1 });

        // 2. Fetch present attendances (increase balance)
        const attendances = await Attendance.find({ workerId, status: "present" })
            .populate("jobCardId")
            .sort({ createdAt: -1 });

        // 3. Map payouts to transaction format (debits)
        const payoutTransactions = payouts.map(p => {
            let remarks = p.remarks || `Payout for ${p.jobCardId?.patientDetails?.name || 'Job'}`;
            if (p.deductionAmount > 0) {
                remarks += ` (Deduction: ₹${p.deductionAmount} - Reason: ${p.deductionReason || 'Fine/Recovery'})`;
            }
            return {
                _id: p._id,
                type: "payout",
                amount: p.amount,
                deductionAmount: p.deductionAmount || 0,
                deductionReason: p.deductionReason || "",
                direction: "decrease", // minus, red
                date: p.payoutDate || p.createdAt,
                status: p.status,
                paymentMethod: p.paymentMethod,
                transactionId: p.transactionId,
                remarks: remarks,
                patientName: p.jobCardId?.patientDetails?.name
            };
        });

        // 4. Map attendances to transaction format (credits)
        const attendanceTransactions = attendances.map(a => {
            const salary = a.todaySalary !== null && a.todaySalary !== undefined
                ? a.todaySalary
                : (a.jobCardId?.perDayNurseCost || 0);
            return {
                _id: a._id,
                type: "earning",
                amount: salary,
                direction: "increase", // plus, green
                date: a.checkInTime || a.createdAt,
                status: "present",
                remarks: `Attendance marked present for ${a.jobCardId?.patientDetails?.name || 'Job'} (${a.date})`,
                patientName: a.jobCardId?.patientDetails?.name
            };
        });

        // 5. Merge and sort by date descending
        const combined = [...payoutTransactions, ...attendanceTransactions].sort(
            (a, b) => new Date(b.date) - new Date(a.date)
        );

        return combined;
    } catch (error) {
        console.error("Error in getWorkerHistoryService:", error);
        throw error;
    }
};

const getAdminAllWorkersPayablesService = async (filters = {}) => {
    try {
        const { startDate, endDate, datePreset } = filters;
        let start, end;
        const now = new Date();

        if (datePreset && datePreset !== "all") {
            if (datePreset === "today") {
                start = new Date(now);
                start.setUTCHours(0, 0, 0, 0);
                end = new Date(now);
                end.setUTCHours(23, 59, 59, 999);
            } else if (datePreset === "week") {
                start = new Date(now);
                start.setUTCDate(now.getUTCDate() - 7);
                start.setUTCHours(0, 0, 0, 0);
                end = new Date(now);
                end.setUTCHours(23, 59, 59, 999);
            } else if (datePreset === "month") {
                start = new Date(now);
                start.setUTCDate(now.getUTCDate() - 30);
                start.setUTCHours(0, 0, 0, 0);
                end = new Date(now);
                end.setUTCHours(23, 59, 59, 999);
            }
        } else if (startDate && endDate) {
            const parsedStart = new Date(startDate);
            const parsedEnd = new Date(endDate);
            if (!isNaN(parsedStart.getTime()) && !isNaN(parsedEnd.getTime())) {
                start = parsedStart;
                start.setUTCHours(0, 0, 0, 0);
                end = parsedEnd;
                end.setUTCHours(23, 59, 59, 999);
            }
        }

        let startStr = '';
        let endStr = '';
        if (start) {
            startStr = start.toISOString().split('T')[0];
        }
        if (end) {
            endStr = end.toISOString().split('T')[0];
        }

        // 1. Get all assigned job cards
        const ongoingJobs = await jobCardRepository.getJobCardsByStatus("assigned");
        let summaryList = [];

        for (const job of ongoingJobs) {
            const workersToProcess = [];
            if (job.workers && job.workers.assigned) {
                workersToProcess.push(job.workers.assigned._id || job.workers.assigned);
            }
            if (job.workers && Array.isArray(job.workers.replaced)) {
                job.workers.replaced.forEach(r => {
                    workersToProcess.push(r._id || r);
                });
            }

            for (const workerId of workersToProcess) {
                const jobCardId = job._id;

                const balanceResult = await getWorkerBalanceService(workerId, jobCardId, {
                    startDate: startStr,
                    endDate: endStr,
                    rawStartDate: start,
                    rawEndDate: end
                });
                if (balanceResult.success) {
                    const isCurrentlyAssigned = job.workers.assigned && (job.workers.assigned._id || job.workers.assigned).toString() === workerId.toString();
                    if (isCurrentlyAssigned || balanceResult.data.availableBalance > 0 || balanceResult.data.pendingAmount > 0) {
                        summaryList.push(balanceResult.data);
                    }
                }
            }
        }

        // 2. Apply Dynamic Filters
        if (filters.search) {
            const s = filters.search.toLowerCase();
            summaryList = summaryList.filter(item =>
                (item.workerName && item.workerName.toLowerCase().includes(s)) ||
                (item.patientName && item.patientName.toLowerCase().includes(s))
            );
        }

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

        const { 
            paymentMethod, 
            transactionId, 
            remarks, 
            paidFromDate, 
            paidUntilDate, 
            paymentproof,
            deductionAmount,
            deductionReason
        } = updateData;

        const updatedPayout = await WorkerPayoutRepository.updateWorkerPayout(payoutId, {
            paymentMethod,
            transactionId,
            remarks,
            paidFromDate,
            paidUntilDate,
            paymentproof,
            deductionAmount: Number(deductionAmount) || 0,
            deductionReason: deductionReason || "",
            status: "paid",
            payoutDate: new Date()
        });

        // Recalculate and update the worker's global available balance in MongoDB
        await updateWorkerGlobalBalance(updatedPayout.workerId);

        // Fetch updated balance to store correct running balance
        const updatedWorker = await workerRepository.getWorkerById(updatedPayout.workerId);

        const payoutWithDetails = await WorkerPayoutRepository.getWorkerbyPayoutId(payoutId);
        const workerDevice = payoutWithDetails?.workerId?.fcmToken;
        const patientName = payoutWithDetails?.jobCardId?.patientDetails?.name || "your job";

        let transactionRemarks = remarks || `Payout approved for ${patientName}'s job`;
        if (updatedPayout.deductionAmount > 0) {
            transactionRemarks += ` (Deduction: ₹${updatedPayout.deductionAmount} - Reason: ${updatedPayout.deductionReason || 'Fine/Recovery'})`;
        }

        // Record a transaction for this approved payout!
        await WorkerTransactionHistoryRepository.createTransaction({
            workerId: updatedPayout.workerId,
            jobCardId: updatedPayout.jobCardId,
            payoutId: updatedPayout._id,
            amount: updatedPayout.amount,
            status: "debited",
            remarks: transactionRemarks,
            transactionType: "paid_payout",
            balanceAfterTransaction: updatedWorker.availableBalance
        });

        if (workerDevice) {
            let bodyText = `Your payout request of ₹${updatedPayout.amount} for ${patientName}'s job has been approved and marked as paid.`;
            if (updatedPayout.deductionAmount > 0) {
                const actualPaid = updatedPayout.amount - updatedPayout.deductionAmount;
                bodyText += ` (Actual Paid: ₹${actualPaid}, Deduction: ₹${updatedPayout.deductionAmount} for ${updatedPayout.deductionReason || 'Fine/Recovery'}).`;
            }
            await sendFcmNotification(workerDevice, {
                title: "Payout Approved 💰",
                body: bodyText,
            }, {
                type: "payout_approved",
                jobCardId: updatedPayout.jobCardId.toString(),
                payoutId: payoutId.toString()
            });
        }

        return {
            success: true,
            message: "Payout approved and marked as paid",
            data: updatedPayout
        };
    } catch (error) {
        throw new Error(error.message);
    }
};

const getPaidPayoutsService = async (filters = {}) => {
    try {
        const { startDate, endDate, datePreset } = filters;
        let query = { status: "paid" };

        let start, end;
        const now = new Date();

        if (datePreset && datePreset !== "all") {
            if (datePreset === "today") {
                start = new Date(now);
                start.setUTCHours(0, 0, 0, 0);
                end = new Date(now);
                end.setUTCHours(23, 59, 59, 999);
            } else if (datePreset === "week") {
                start = new Date(now);
                start.setUTCDate(now.getUTCDate() - 7);
                start.setUTCHours(0, 0, 0, 0);
                end = new Date(now);
                end.setUTCHours(23, 59, 59, 999);
            } else if (datePreset === "month") {
                start = new Date(now);
                start.setUTCDate(now.getUTCDate() - 30);
                start.setUTCHours(0, 0, 0, 0);
                end = new Date(now);
                end.setUTCHours(23, 59, 59, 999);
            }
        } else if (startDate && endDate) {
            start = new Date(startDate);
            start.setUTCHours(0, 0, 0, 0);
            end = new Date(endDate);
            end.setUTCHours(23, 59, 59, 999);
        }

        if (start && end) {
            query.payoutDate = { $gte: start, $lte: end };
        }

        const paidPayouts = await WorkerPayout.find(query)
            .populate("workerId")
            .populate("jobCardId")
            .sort({ payoutDate: -1, createdAt: -1 });

        return {
            success: true,
            data: paidPayouts
        };
    } catch (error) {
        throw new Error(error.message);
    }
};

const rejectPayoutRequestService = async (payoutId, updateData = {}) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(payoutId)) {
            throw new Error("Invalid Payout ID");
        }

        const payout = await WorkerPayoutRepository.getPayoutById(payoutId);
        if (!payout) throw new Error("Payout request not found");
        if (payout.status !== "pending") throw new Error(`Payout is already ${payout.status}`);

        const { remarks } = updateData;

        const updatedPayout = await WorkerPayoutRepository.updateWorkerPayout(payoutId, {
            remarks: remarks || "Payout request rejected by Admin",
            status: "rejected",
            payoutDate: new Date()
        });

        // Recalculate global available balance
        await updateWorkerGlobalBalance(updatedPayout.workerId);

        const payoutWithDetails = await WorkerPayoutRepository.getWorkerbyPayoutId(payoutId);
        const workerDevice = payoutWithDetails?.workerId?.fcmToken;
        const patientName = payoutWithDetails?.jobCardId?.patientDetails?.name || "your job";

        if (workerDevice) {
            try {
                await sendFcmNotification(workerDevice, {
                    title: "Payout Request Rejected ❌",
                    body: `Your payout request of ₹${updatedPayout.amount} for ${patientName}'s job has been rejected.`,
                }, {
                    type: "payout_rejected",
                    jobCardId: updatedPayout.jobCardId.toString(),
                    payoutId: payoutId.toString()
                });
            } catch (fcmErr) {
                console.error("FCM failed but rejection succeeded:", fcmErr);
            }
        }

        return {
            success: true,
            message: "Payout request rejected successfully",
            data: updatedPayout
        };
    } catch (error) {
        throw new Error(error.message);
    }
};

const getAllPayoutByDateService = async ({ startDate, endDate }) => {
    try {
        if (!startDate || !endDate) throw new Error("Start date and end date are required");
        return await WorkerPayoutRepository.getAllPayoutByDate({ startDate, endDate });
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
    getPaidPayoutsService,
    rejectPayoutRequestService,
    getAllPayoutByDateService,
    updateWorkerGlobalBalance
};
