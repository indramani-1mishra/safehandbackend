const ClientRepository = require("../repository/ClientRepository");
const JobCard = require("../modals/jobcartModel");
const ClientPayment = require("../modals/clientPayment");
const WorkerPayout = require("../modals/Workerpayeout");
const Enquiry = require("../modals/enqueryModel");

/**
 * Generate the Admin Dashboard Payment Summary with Filters
 * @param {string} filter - 'today', 'week', 'month', 'all'
 */
const getAdminDashboardSummary = async (filter = 'all') => {
    try {
        const now = new Date();
        let startDate = new Date(0); // Default to beginning of time

        if (filter === 'today') {
            startDate = new Date(now);
            startDate.setHours(0, 0, 0, 0);
        } else if (filter === 'week') {
            startDate = new Date(now);
            startDate.setDate(startDate.getDate() - 7);
        } else if (filter === 'month') {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }

        // 1. Total Received (Actual payments from clients)
        const revenueResult = await ClientPayment.aggregate([
            { $match: { paymentDate: { $gte: startDate }, amount: { $gt: 0 } } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const totalReceived = revenueResult.length > 0 ? revenueResult[0].total : 0;

        // 2. Total Due (Billed to clients via attendance)
        // We calculate this by looking at records where amount is 0 (auto-generated from attendance)
        // and looking up the perDayCustomerCost from the JobCard.
        const billedResult = await ClientPayment.aggregate([
            { $match: { paymentDate: { $gte: startDate }, amount: 0 } },
            {
                $lookup: {
                    from: "jobcards",
                    localField: "jobCardId",
                    foreignField: "_id",
                    as: "jobInfo"
                }
            },
            { $unwind: "$jobInfo" },
            { $group: { _id: null, total: { $sum: "$jobInfo.perDayCustomerCost" } } }
        ]);
        const totalBilled = billedResult.length > 0 ? billedResult[0].total : 0;

        // 3. Total Payment given to Worker
        const workerPayoutResult = await WorkerPayout.aggregate([
            { $match: { payoutDate: { $gte: startDate }, status: "paid" } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const totalPaidToWorkers = workerPayoutResult.length > 0 ? workerPayoutResult[0].total : 0;

        // 4. Current Outstanding (Global snapshot, not time-filtered)
        const ongoingJobs = await JobCard.find({ status: "assigned" });
        let currentOutstanding = 0;
        for (const job of ongoingJobs) {
            const latest = await ClientRepository.getLatestClientPaymentByJobCardId(job._id);
            currentOutstanding += (latest ? latest.remainingAmount : 0);
        }

        // 5. Enquiry Stats
        const totalEnquiries = await Enquiry.countDocuments({
            createdAt: { $gte: startDate }
        });

        return {
            summary: {
                totalReceived,
                totalBilled,
                totalPaidToWorkers,
                netBalance: totalReceived - totalPaidToWorkers,
                currentOutstanding
            },
            stats: {
                activeJobs: ongoingJobs.length,
                newEnquiries: totalEnquiries,
                filterApplied: filter
            }
        };
    } catch (error) {
        throw error;
    }
};

module.exports = {
    getAdminDashboardSummary
};
