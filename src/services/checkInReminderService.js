const cron = require("node-cron");
const JobCard = require("../modals/jobcartModel");
const Worker = require("../modals/workerModel");
const { sendCallTypeFcmNotification } = require("../utils/fcmService");

const checkAndSendCheckInReminders = async () => {
    try {
        console.log(`--- [${new Date().toLocaleString()}] Starting Check-In Reminder Check ---`);
        const now = new Date();

        // Get today's date in IST format "DD/MM/YYYY"
        const formatter = new Intl.DateTimeFormat('en-IN', {
            timeZone: 'Asia/Kolkata',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
        const todayStr = formatter.format(now); // e.g. "29/05/2026"

        // Find all active or assigned job cards
        const activeJobs = await JobCard.find({ status: { $in: ["assigned", "ongoing"] } })
            .populate("serviceDetails.service")
            .populate("workers.assigned");

        for (const job of activeJobs) {
            const serviceType = job.serviceDetails?.service?.serviceType || "";
            const is12Hour = serviceType.toLowerCase().includes("12 hour");
            if (!is12Hour) continue;

            const worker = job.workers?.assigned;
            if (!worker || !worker.fcmToken) continue;

            if (!job.checkInTime) continue;

            // Compute target check-in time for today in IST
            const checkInHour = job.checkInTime.getHours();
            const checkInMinute = job.checkInTime.getMinutes();

            const checkInDate = new Date(now);
            checkInDate.setHours(checkInHour, checkInMinute, 0, 0);

            // Time difference in minutes
            const diffMs = checkInDate.getTime() - now.getTime();
            const diffMinutes = diffMs / (1000 * 60);

            // If we are between 50 to 70 minutes before check-in time (approx 1 hour)
            if (diffMinutes >= 50 && diffMinutes <= 70) {
                // Find this job card's booking slot inside the worker's array
                const slot = worker.workerBookingSlot.find(
                    s => s.jobCardId.toString() === job._id.toString()
                );

                if (slot && slot.lastNotifiedDate !== todayStr) {
                    console.log(`Sending check-in reminder call notification to worker ${worker.name} for Job Card #${job._id}`);
                    
                    // Send Call-type FCM notification
                    await sendCallTypeFcmNotification(
                        worker.fcmToken,
                        "Shift Check-In Confirmation",
                        `Kya aap job pe jane ke liye tyyar hain for patient ${job.patientDetails?.name || ""}?`,
                        {
                            jobId: job._id.toString(),
                            workerId: worker._id.toString(),
                            type: "incoming_call",
                            callType: "checkin_reminder"
                        }
                    );

                    // Update lastNotifiedDate for this slot
                    await Worker.findOneAndUpdate(
                        { _id: worker._id, "workerBookingSlot.jobCardId": job._id },
                        { $set: { "workerBookingSlot.$.lastNotifiedDate": todayStr } }
                    );
                }
            }
        }
    } catch (error) {
        console.error("Error in check-in reminder cron job:", error.message);
    }
};

const startCheckInReminderCron = () => {
    // Run every 5 minutes
    cron.schedule("*/5 * * * *", () => {
        checkAndSendCheckInReminders();
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata"
    });

    console.log("Check-In Reminder Cron Scheduler Initialized (Every 5 minutes).");
};

module.exports = {
    startCheckInReminderCron
};
