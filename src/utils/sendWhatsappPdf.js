const axios = require("axios");
const { WHATSAPP_TOKEN, PHONE_NUMBER_ID } = require("../config/serverConfig");
const sendWhatsappPdf = async (phoneNumber, pdfUrl, filename = "job_card.pdf", caption = "") => {
    try {
        const response = await axios.post(
            `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
            {
                messaging_product: "whatsapp",
                to: phoneNumber,
                type: "document",
                document: {
                    link: pdfUrl,
                    filename: filename,
                    caption: caption
                },
            },
            {
                headers: {
                    Authorization: `Bearer ${WHATSAPP_TOKEN}`,
                    "Content-Type": "application/json",
                },
            }
        );
        console.log(" WhatsApp PDF sent successfully:", response.data);
    } catch (error) {
        console.error(" Failed to send WhatsApp PDF:", error.response?.data || error.message);
    }
};

module.exports = {
    sendWhatsappPdf
};