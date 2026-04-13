const cron = require("node-cron");
const { sendQuestionPdfToWhatsapp } = require("../utils/sendquestionTowhatsapp");
const { DEFAULT_ADMIN_PHONE } = require("../config/serverConfig");

/**
 * GK Question PDF ko WhatsApp pe send karta hai
 * Default recipient: Admin phone number (serverConfig se)
 * Isko customize kar sakte ho — jisko bhi bhejna ho uska phone/name yahan set karo
 */
const sendGKQuestionNow = async () => {
    try {
        const phoneNumber = 917236005136;  // ← Yahan recipient ka phone daal do
        const recipientName = "Raj";             // ← Recipient ka naam

        console.log(`--- [${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}] 📚 Sending daily GK Question PDF... ---`);

        const result = await sendQuestionPdfToWhatsapp(phoneNumber, recipientName);

        if (result && result.success) {
            console.log(`✅ GK Question PDF sent successfully! PDF URL: ${result.pdfUrl}`);
        } else {
            console.error("❌ GK Question PDF sending failed.");
        }
    } catch (error) {
        console.error("❌ Error in GK Question Cron:", error.message);
    }
};

/**
 * Schedule GK Questions:
 * - Server start hone pe ek baar turant bhejta hai
 * - Roz subah 6:00 AM (IST) pe bhejta hai
 * - Roz shaam 6:00 PM (IST) pe bhejta hai
 */
const startGKQuestionCron = () => {
    // Cron: "0 6,18 * * *" = 6:00 AM and 6:00 PM daily
    cron.schedule("0 6,18 * * *", () => {
        sendGKQuestionNow();
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata"
    });

    console.log("📚 GK Question Cron Scheduler Initialized (6:00 AM & 6:00 PM IST).");

    // ✅ Server start hone pe ek baar turant bhej do
    sendGKQuestionNow();
};

module.exports = {
    startGKQuestionCron
};
