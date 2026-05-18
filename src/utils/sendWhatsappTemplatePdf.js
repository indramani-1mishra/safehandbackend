const axios = require("axios");
const { WHATSAPP_TOKEN, PHONE_NUMBER_ID } = require("../config/serverConfig");
const { sendWhatsappPdf } = require("./sendWhatsappPdf");

const cleanPhoneNumber = (phone) => {
    if (!phone) return "";
    let clean = phone.toString().replace(/\D/g, "");
    if (clean.length === 10) {
        clean = `91${clean}`;
    }
    return clean;
};

const sendWhatsappTemplatePdf = async (phoneNumber, pdfUrl, filename, recipientName, languageCode = "en", buttonValue = "job", templateName = "contract_message", bodyText) => {
    const cleanPhone = cleanPhoneNumber(phoneNumber);
    if (!cleanPhone) {
        throw new Error("Invalid phone number provided for WhatsApp template send.");
    }

    try {
        const templateBodyText = bodyText || recipientName || "Please find your attached PDF.";
        const response = await axios.post(
            `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`,
            {
                messaging_product: "whatsapp",
                to: cleanPhone,
                type: "template",
                template: {
                    name: templateName,
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
                                    text: templateBodyText
                                }
                            ]
                        },
                        {
                            type: "button",
                            sub_type: "url",
                            index: "0",
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
        console.log("WhatsApp Template PDF sent successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("Failed to send WhatsApp Template PDF:", error.response?.data || error.message);
        console.log("Attempting fallback to direct WhatsApp document send...");
        try {
            await sendWhatsappPdf(cleanPhone, pdfUrl, filename, bodyText || "Please find your attached PDF document.");
            return { fallback: true };
        } catch (fallbackError) {
            console.error("Fallback WhatsApp PDF send failed:", fallbackError.response?.data || fallbackError.message || fallbackError);
            throw error;
        }
    }
};

module.exports = {
    sendWhatsappTemplatePdf
};
