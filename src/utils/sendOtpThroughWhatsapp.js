const axios = require("axios");
const { WHATSAPP_TOKEN, PHONE_NUMBER_ID } = require("../config/serverConfig");

const sendOtpThroughWhatsapp = async (phone, otp) => {
    // Sanitizing phone number: remove any non-digit characters
    let cleanPhone = phone.toString().replace(/\D/g, "");

    // If it's a 10-digit number, prepend 91 (India)
    if (cleanPhone.length === 10) {
        cleanPhone = `91${cleanPhone}`;
    }

    const url = `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`;

    console.log(`[WhatsApp] Attempting to send OTP to: ${cleanPhone}`);

    try {
        const payload = {
            messaging_product: "whatsapp",
            to: cleanPhone,
            type: "template",
            template: {
                name: "safehandotp",
                language: {
                    code: "en_US", // Matches English (US) in your screenshot
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
        };

        const response = await axios.post(url, payload, {
            headers: {
                Authorization: `Bearer ${WHATSAPP_TOKEN}`,
                "Content-Type": "application/json",
            },
        });

        console.log("[WhatsApp] API Success Response:", JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error) {
        const errorData = error.response ? error.response.data : error.message;
        console.error("[WhatsApp] API Error Details:", JSON.stringify(errorData, null, 2));
        throw new Error(`WhatsApp Send Error: ${JSON.stringify(errorData)}`);
    }
};

module.exports = sendOtpThroughWhatsapp;