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
            const latestPayment = await ClientRepository.getLatestClientPaymentByJobCardId(job._id);
            const remaining = latestPayment ? latestPayment.remainingAmount : 0;
            const perDayCost = job.perDayCustomerCost || 0;
            const cycleDays = job.customerPaymentCycleDays || 1;
            const cycleThreshold = perDayCost * cycleDays;

            // Condition: If balance is more than or equal to cycle threshold
            if (remaining >= cycleThreshold && remaining > 0) {
                const message = `Payment Reminder: Your outstanding balance for ${job.patientDetails.name} is ₹${remaining}. This exceeds your current payment cycle of ${cycleDays} days. Please make a payment soon.`;

                if (job.patientDetails.phone) {
                    const phone = `91${job.patientDetails.phone}`;
                    await sendWhatsappMessage(phone, message, job.patientDetails.name);
                    console.log(`Overdue reminder sent to ${job.patientDetails.name} (${phone}) - Balance: ₹${remaining}`);
                }
            } else if (remaining >= (cycleThreshold * 0.8) && remaining > 0) {
                // Near limit reminder (80% of cycle reached)
                const message = `Payment Notice: Your outstanding balance for ${job.patientDetails.name} is ₹${remaining}. You are approaching your payment cycle limit.`;
                
                if (job.patientDetails.phone) {
                    const phone = `91${job.patientDetails.phone}`;
                    await sendWhatsappMessage(phone, message, job.patientDetails.name);
                    console.log(`Near-limit notice sent to ${job.patientDetails.name} (${phone}) - Balance: ₹${remaining}`);
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
