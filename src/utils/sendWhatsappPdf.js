const axios = require("axios");
const { WHATSAPP_TOKEN, PHONE_NUMBER_ID } = require("../config/serverConfig");
const { messaging } = require("firebase-admin");

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

const sendJobPostNotification = async (phoneNumber, data) => {
    try {
        const cleanPhone = cleanPhoneNumber(phoneNumber);
        const { caption, workername, imageurl } = data;
        const payload = {
            messaging_product: "whatsapp",
            to: cleanPhone,
            type: 'template',
            template: {
                name: "jobpostmessage",
                language: {
                    code: "en"
                },
                components: [
                    {
                        type: "header",
                        parameters: [
                            {
                                type: "image",
                                image: {
                                    link: imageurl
                                }
                            }

                        ]
                    },
                    {
                        type: "body",
                        parameters: [
                            {
                                type: "text",
                                text: workername
                            },
                            {
                                type: "text",
                                text: caption
                            }
                        ]
                    },

                ]
            }

        }

        const response = await axios.post(
            `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${WHATSAPP_TOKEN}`,
                    "Content-Type": "application/json",
                },
            }
        );
        console.log("WhatsApp Notification sent successfully:", response.data);
        return response.data;

    } catch (error) {
        console.log("error in send job notification in whatsapp" + error);
        throw error;
    }
}



module.exports = {
    sendWhatsappPdf,
    sendJobPostNotification
};
