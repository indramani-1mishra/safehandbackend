const axios = require("axios");
const { WHATSAPP_TOKEN, PHONE_NUMBER_ID } = require("../config/serverConfig");

const cleanPhoneNumber = (phone) => {
    if (!phone) return "";
    let clean = phone.toString().replace(/\D/g, "");
    if (clean.length === 10) {
        clean = `91${clean}`;
    }
    return clean;
};

const sendWhatsappPdf = async (phoneNumber, pdfUrl, filename = "job_card.pdf", caption = "") => {
    const cleanPhone = cleanPhoneNumber(phoneNumber);
    if (!cleanPhone) {
        throw new Error("Invalid phone number provided for WhatsApp PDF send.");
    }

    try {
        const response = await axios.post(
            `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`,
            {
                messaging_product: "whatsapp",
                to: cleanPhone,
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
        console.log("WhatsApp PDF sent successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("Failed to send WhatsApp PDF:", error.response?.data || error.message);
        throw error;
    }
};

module.exports = {
    sendWhatsappPdf
};
