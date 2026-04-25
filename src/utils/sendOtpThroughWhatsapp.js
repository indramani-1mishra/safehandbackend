const axios = require("axios");
const { WHATSAPP_TOKEN, PHONE_NUMBER_ID } = require("../config/serverConfig");

const sendOtpThroughWhatsapp = async (phone, otp) => {

    const url = `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`;

    try {
        const response = await axios.post(url, {
            messaging_product: "whatsapp",
            to: `91${phone}`,
            type: "template",
            template: {
                name: "safehandotp",
                language: {
                    code: "en_US",
                },
                components: [
                    {
                        type: "body",
                        parameters: [
                            {
                                type: "text",
                                text: otp,
                            },
                        ],
                    },
                    {
                        type: "button",
                        sub_type: "url",
                        index: "0",
                        parameters: [
                            {
                                type: "text",
                                text: otp,
                            },
                        ],
                    },
                ],
            },
        }, {
            headers: {
                Authorization: `Bearer ${WHATSAPP_TOKEN}`,
                "Content-Type": "application/json",
            },
        });

        console.log("Response:", response.data);
        return response.data;
    } catch (error) {
        console.error("WhatsApp API Error Details:", error.response ? error.response.data : error.message);
        throw error;
    }
};

module.exports = sendOtpThroughWhatsapp;