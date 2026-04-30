const ClientRepository = require("../repository/ClientRepository");
const JobCard = require("../modals/jobcartModel");
const ClientPayment = require("../modals/clientPayment");
const Enquiry = require("../modals/enqueryModel");
const WorkerPayoutService = require("./WorkerPayoutService");

/**
 * Helper to calculate inclusive days
 */
const calculateDaysInclusive = (startDate, endDate) => {
    if (!startDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    return Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) + 1;
};

/**
 * Main function to generate the Admin Dashboard Payment Summary
 */
const getAdminDashboardSummary = async () => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // 1. Revenue Stats
        const allPayments = await ClientPayment.find();
        const totalRevenue = allPayments.reduce((sum, p) => sum + p.amount, 0);
        
        const todayPayments = await ClientPayment.find({
            paymentDate: { $gte: today, $lt: tomorrow }
        });
        const revenueToday = todayPayments.reduce((sum, p) => sum + p.amount, 0);

        // 2. Client Receivables & Alerts
        const ongoingJobs = await JobCard.find({ status: "assigned" });
        let totalReceivable = 0;
        let clientsOverLimitCount = 0;
        let clientsReachLimitCount = 0;

        for (const job of ongoingJobs) {
            const payments = await ClientRepository.getClientPaymentsByJobCardId(job._id);
            const amtPaid = payments.reduce((sum, p) => sum + p.amount, 0);
            
            const totalDuration = calculateDaysInclusive(job.serviceStart, job.serviceEnd);
            const daysPassed = calculateDaysInclusive(job.serviceStart, new Date());
            const perDayRate = job.totalDealAmount / (totalDuration || 1);
            
            const amtConsumed = Math.floor(daysPassed * perDayRate);
            
            if (amtPaid < amtConsumed) {
                totalReceivable += (amtConsumed - amtPaid);
                clientsOverLimitCount++;
            }

            // Check Reach Limit flag
            const lastPayment = payments.sort((a,b) => b.paidUntilDate - a.paidUntilDate)[0];
            if (lastPayment && lastPayment.reachLimit) {
                clientsReachLimitCount++;
            }
        }

        // 3. Worker Payables
        let totalWorkerPayable = 0;
        for (const job of ongoingJobs) {
            if (job.workers && job.workers.assigned) {
                const dueInfo = await WorkerPayoutService.getWorkerPayoutDue(job.workers.assigned, job._id);
                totalWorkerPayable += dueInfo.remainingDue;
            }
        }

        // 4. Enquiry Stats
        const totalEnquiries = await Enquiry.countDocuments();

        return {
            revenue: {
                total: totalRevenue,
                today: revenueToday
            },
            receivables: {
                totalOutstanding: totalReceivable,
                overLimitClients: clientsOverLimitCount,
                reachLimitClients: clientsReachLimitCount
            },
            payables: {
                totalToWorkers: totalWorkerPayable
            },
            stats: {
                activeJobs: ongoingJobs.length,
                totalEnquiries: totalEnquiries
            }
        };
    } catch (error) {
        throw error;
    }
};

module.exports = {
    getAdminDashboardSummary
};
