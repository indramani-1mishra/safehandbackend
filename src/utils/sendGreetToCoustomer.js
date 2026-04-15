const axios = require("axios");
const { PHONE_NUMBER_ID, WHATSAPP_TOKEN } = require("../config/serverConfig");
const sendGreetToCoustomer = async (phone, name) => {
    try {
        const sendmessage = await axios.post(
            `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
            {
                messaging_product: "whatsapp",
                to: `91${phone}`,
                type: "template",
                template: {
                    name: "welcome",
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
        )
        console.log('whatsapp message send successfully ', sendmessage.data);
        if (sendmessage.status !== 200) {
            console.log("Failed to send message to customer", sendmessage.data);
        }
    } catch (error) {
        console.error("Error sending WhatsApp message:", error.response ? error.response.data : error.message);
    }
}


module.exports = {
    sendGreetToCoustomer
}