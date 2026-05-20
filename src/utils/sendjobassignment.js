const axios = require("axios");
const { PHONE_NUMBER_ID, WHATSAPP_TOKEN } = require("../config/serverConfig");

const sendPdfonwhatsapp = async (
    phone,
    pdfurl,
    name,
    servicename,
    filename = "job_assignment.pdf",
    templatename
) => {
    try {

        if (!phone || !pdfurl || !templatename) {
            throw new Error("Missing required fields");
        }

        // sanitize values
        const safeName = String(name || "User")
            .replace(/\n|\t/g, " ")
            .trim();

        const safeServiceName = String(servicename || "Service")
            .replace(/\n|\t/g, " ")
            .trim();

        const url = `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`;

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
                                    link: pdfurl,
                                    filename: filename,
                                },
                            },
                        ],
                    },
                    {
                        type: "body",
                        parameters: templatename === "admin_assignment_pdf" ? [
                            {
                                type: "text",
                                text: safeServiceName,
                            },
                        ] : [
                            {
                                type: "text",
                                text: safeName,
                            },
                            {
                                type: "text",
                                text: safeServiceName,
                            },
                        ]
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

        return response.data;

    } catch (error) {

        console.log(
            "Error sending WhatsApp PDF:",
            error.response?.data || error.message
        );

        return null;
    }
};

module.exports = {
    sendPdfonwhatsapp,
};