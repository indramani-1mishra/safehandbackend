const axios = require("axios");
const { WHATSAPP_TOKEN, PHONE_NUMBER_ID } = require("../config/serverConfig");

const sendWhatsappTemplatePdf = async (phoneNumber, pdfUrl, filename, recipientName, languageCode = "en", buttonValue = "job") => {
    try {
        const response = await axios.post(
            `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
            {
                messaging_product: "whatsapp",
                to: phoneNumber,
                type: "template",
                template: {
                    name: "contract_message",
                    language: {
                        code: languageCode
                    },
                    components: [
                        {
                            type: "header",
                            parameters: [
                                {
                                    type: "document",
                                    document: {
                                        link: pdfUrl,
                                        filename: filename
                                    }
                                }
                            ]
                        },
                        {
                            type: "body",
                            parameters: [
                                {
                                    type: "text",
                                    text: recipientName
                                }
                            ]
                        },
                        {
                            type: "button",
                            sub_type: "url",
                            index: "1",
                            parameters: [
                                {
                                    type: "text",
                                    text: buttonValue
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
        console.log(" WhatsApp Template PDF sent successfully:", response.data);
    } catch (error) {
        console.error(" Failed to send WhatsApp Template PDF:", error.response?.data || error.message);
    }
};

module.exports = {
    sendWhatsappTemplatePdf
};
