const cron = require("node-cron");
const JobCard = require("../modals/jobcartModel");
const ClientRepository = require("../repository/ClientRepository");
const { sendWhatsappMessage } = require("../utils/sendWhatsappMessage");

/**
 * Helper to calculate inclusive days
 */
const calculateDaysInclusive = (startDate, endDate) => {
    if (!startDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

/**
 * Main logic to check all ongoing jobs and send reminders if payment limit is reached.
 */
const checkAndSendPaymentReminders = async () => {
    try {
        console.log(`--- [${new Date().toLocaleString()}] Starting Payment Reminder Check ---`);
        const ongoingJobs = await JobCard.find({ status: "assigned" });

        for (const job of ongoingJobs) {
            const allPayments = await ClientRepository.getClientPaymentsByJobCardId(job._id);
            const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);

            const totalDuration = calculateDaysInclusive(job.serviceStart, job.serviceEnd);
            const perDayAmount = job.totalDealAmount / (totalDuration || 1);

            const daysPassed = calculateDaysInclusive(job.serviceStart, new Date());
            const amountConsumed = daysPassed * perDayAmount;
            const balanceAmount = totalPaid - amountConsumed;
            const balanceDays = Math.floor(balanceAmount / perDayAmount);

            // Condition: If balance is less than or equal to 1 day coverage
            if (balanceDays <= 1) {
                const message = `${balanceDays < 0 ? 0 : balanceDays}  `;

                if (job.patientDetails.phone) {
                    const phone = `91${job.patientDetails.phone}`;
                    await sendWhatsappMessage(phone, message, job.patientDetails.name);
                    console.log(`Reminder sent to ${job.patientDetails.name} (${phone})`);
                }
            }
        }
    } catch (error) {
        console.error("Error in Scheduled Payment Reminder:", error.message);
    }
};

/**
 * Schedule tasks using node-cron.
 * Runs at 10:00 AM and 10:00 PM every day.
 */
const startPaymentReminderCron = () => {
    // 10:00 AM and 10:00 PM (24h format: 10, 22)
    cron.schedule("0 10,22 * * *", () => {
        checkAndSendPaymentReminders();
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata"
    });

    console.log("Payment Reminder Cron Scheduler Initialized (10:00 AM & 10:00 PM).");

    // Optional: Run once at startup to ensure no messages are missed
    checkAndSendPaymentReminders();
};

module.exports = {
    startPaymentReminderCron
};
