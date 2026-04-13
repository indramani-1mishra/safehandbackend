const axios = require("axios");
const { WHATSAPP_TOKEN, PHONE_NUMBER_ID, DEFAULT_ADMIN_PHONE } = require("../config/serverConfig");
const { genrateUniqueGKQuestion } = require("./usegemini");
const { generateGKQuestionPdfTemplate } = require("./gkQuestionPdfTemplate");
const { generatePdf } = require("./pdfGenerator");
const { uploadPdfToS3 } = require("./s3Upload");

/**
 * Complete flow:
 * 1. Gemini se 5 GK questions generate karo (Hindi me)
 * 2. Questions ka styled PDF banao
 * 3. PDF ko S3 pe upload karo
 * 4. WhatsApp pe PDF bhejo
 * 
 * @param {string} phoneNumber - Recipient phone number (with country code, e.g. "919876543210")
 * @param {string} recipientName - Name of the person receiving the PDF (for caption)
 * @returns {Object|null} - { success, pdfUrl, data } or null on failure
 */
async function sendQuestionPdfToWhatsapp(phoneNumber, recipientName = "R") {
    try {
        // -------- Step 1: Generate GK Questions via Gemini --------
        console.log("📚 Step 1: Generating GK questions from Gemini...");
        const gkData = await genrateUniqueGKQuestion();

        if (!gkData || !gkData.questions || gkData.questions.length === 0) {
            console.error("❌ Failed to generate GK questions from Gemini.");
            return null;
        }
        console.log(`✅ ${gkData.questions.length} GK questions generated successfully.`);

        // -------- Step 2: Generate PDF from HTML template --------
        console.log("📄 Step 2: Generating PDF from HTML template...");
        const htmlContent = generateGKQuestionPdfTemplate(gkData);
        const pdfBuffer = await generatePdf(htmlContent);
        console.log("✅ PDF generated successfully. Size:", pdfBuffer.length, "bytes");

        // -------- Step 3: Upload PDF to S3 --------
        console.log("☁️ Step 3: Uploading PDF to S3...");
        const fileName = `GK_Questions_${new Date().toISOString().slice(0, 10)}.pdf`;
        const pdfUrl = await uploadPdfToS3(pdfBuffer, fileName);
        console.log("✅ PDF uploaded to S3:", pdfUrl);

        // -------- Step 4: Send PDF via WhatsApp --------
        console.log("📲 Step 4: Sending PDF via WhatsApp...");
        const targetPhone = 917236005136 || DEFAULT_ADMIN_PHONE;

        const caption = `📝 दैनिक GK प्रश्नोत्तरी\n\nनमस्ते ${recipientName}! 🙏\nआज के 5 महत्वपूर्ण GK प्रश्न और उत्तर इस PDF में हैं।\n\n📖 UP Police | UP SI | PCS\n\n— SafeHand Lifecare`;

        const response = await axios.post(
            `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
            {
                messaging_product: "whatsapp",
                to: targetPhone,
                type: "document",
                document: {
                    link: pdfUrl,
                    filename: fileName,
                    caption: caption
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${WHATSAPP_TOKEN}`,
                    "Content-Type": "application/json"
                }
            }
        );

        console.log("✅ GK Question PDF sent to WhatsApp successfully:", response.data);
        return {
            success: true,
            pdfUrl: pdfUrl,
            data: gkData,
            whatsappResponse: response.data
        };

    } catch (err) {
        console.error("❌ Failed to send GK question PDF to WhatsApp:", err.response?.data || err.message);
        return null;
    }
}

/**
 * Send GK Question PDF to multiple phone numbers
 * @param {Array<{phone: string, name: string}>} recipients - Array of recipients
 * @returns {Object} - { pdfUrl, results: [{phone, success, error}] }
 */
async function sendQuestionPdfToMultipleRecipients(recipients = []) {
    try {
        // -------- Step 1: Generate questions & PDF once --------
        console.log("📚 Generating GK questions for bulk send...");
        const gkData = await genrateUniqueGKQuestion();

        if (!gkData || !gkData.questions || gkData.questions.length === 0) {
            console.error("❌ Failed to generate GK questions.");
            return null;
        }

        const htmlContent = generateGKQuestionPdfTemplate(gkData);
        const pdfBuffer = await generatePdf(htmlContent);
        const fileName = `GK_Questions_${new Date().toISOString().slice(0, 10)}.pdf`;
        const pdfUrl = await uploadPdfToS3(pdfBuffer, fileName);
        console.log("✅ PDF ready at:", pdfUrl);

        // -------- Step 2: Send to all recipients --------
        const results = [];
        for (const recipient of recipients) {
            try {
                const caption = `📝 दैनिक GK प्रश्नोत्तरी\n\nनमस्ते ${recipient.name}! 🙏\nआज के 5 GK प्रश्न इस PDF में हैं।\n\n— SafeHand Lifecare`;

                await axios.post(
                    `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
                    {
                        messaging_product: "whatsapp",
                        to: recipient.phone,
                        type: "document",
                        document: {
                            link: pdfUrl,
                            filename: fileName,
                            caption: caption
                        }
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${WHATSAPP_TOKEN}`,
                            "Content-Type": "application/json"
                        }
                    }
                );
                console.log(`✅ Sent to ${recipient.name} (${recipient.phone})`);
                results.push({ phone: recipient.phone, name: recipient.name, success: true });
            } catch (sendErr) {
                console.error(`❌ Failed for ${recipient.phone}:`, sendErr.response?.data || sendErr.message);
                results.push({ phone: recipient.phone, name: recipient.name, success: false, error: sendErr.message });
            }
        }

        return { pdfUrl, results, data: gkData };

    } catch (err) {
        console.error("❌ Bulk GK Question send failed:", err.message);
        return null;
    }
}

module.exports = {
    sendQuestionPdfToWhatsapp,
    sendQuestionPdfToMultipleRecipients
};
