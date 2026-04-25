const axios = require("axios");
const { WHATSAPP_TOKEN, PHONE_NUMBER_ID } = require("../config/serverConfig");
const sendWhatsappMessage = async (phoneNumber, message, name) => {
    try {
        const response = await axios.post(
            `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
            {
                messaging_product: "whatsapp",
                to: phoneNumber,
                type: "template",
                template: {
                    name: 'payment_reminder',
                    language: {
                        code: "en",
                    },
                    components: [
                        {
                            type: "header",
                            parameters: [
                                {
                                    type: "text",
                                    text: name
                                }
                            ]
                        },
                        {
                            type: "body",
                            parameters: [
                                {
                                    type: "text",
                                    text: message
                                }
                            ]
                        },
                        {
                            type: "button",
                            sub_type: "url",
                            index: "1", // Index 0 Call hai, isliye 1 try kar rahe hain
                            parameters: [
                                {
                                    type: "text",
                                    text: "pay"
                                }
                            ]
                        }
                    ]
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${WHATSAPP_TOKEN}`,
                    "Content-Type": "application/json",
                },
            }
        );
        console.log(" WhatsApp message sent successfully:", response.data);
    } catch (error) {
        console.error(" Failed to send WhatsApp message:", error.response?.data || error.message);
    }
};

module.exports = {
    sendWhatsappMessage
};