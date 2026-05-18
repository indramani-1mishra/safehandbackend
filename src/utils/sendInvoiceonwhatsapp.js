const axios = require("axios");
const { PHONE_NUMBER_ID, WHATSAPP_TOKEN } = require("../config/serverConfig");

const sendInvoiceOnWhatsapp = async (
    phone,
    url,
    filename,
    recipientName,
    service,
    templatename = "purchase_receipt_1"
) => {

    if (!phone) {
        console.warn("No phone number provided");
        return;
    }

    const payload = {
        messaging_product: "whatsapp",
        to: `91${phone}`,
        type: "template",

        template: {
            name: templatename,

            language: {
                code: "en_US",
            },

            components: [
                {
                    type: "header",

                    parameters: [
                        {
                            type: "document",

                            document: {
                                link: url,
                                filename: filename || "invoice.pdf"
                            }
                        }
                    ]
                },

                {
                    type: "body",

                    parameters: [
                        {
                            type: "text",
                            text: recipientName || "Customer"
                        },
                        {
                            type: "text",
                            text: service || "Healthcare Service"
                        }
                    ]
                }
            ]
        }
    };

    try {

        const response = await axios.post(
            `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${WHATSAPP_TOKEN}`,
                    "Content-Type": "application/json"
                }
            }
        );

        console.log("WhatsApp PDF sent successfully");
        console.log(response.data);

    } catch (error) {

        console.error(
            "Error sending WhatsApp PDF:",
            error.response?.data || error.message
        );
    }
};

module.exports = {
    sendInvoiceOnWhatsapp
};