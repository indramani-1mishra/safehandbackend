const { TWILIO_SID, TWILIO_AUTHTOKEN, TWILIO_SIRVICEID } = require("../config/serverConfig");
const twilio = require("twilio");
async function sendOtp(phone) {
    const client = twilio(TWILIO_SID, TWILIO_AUTHTOKEN);
    const verification = await client.verify.v2.services(TWILIO_SIRVICEID)
        .verifications
        .create({ to: `+91${phone}`, channel: "sms" });
        
    return verification;
}

async function verifyOtp(phone, otp) {
    const client = twilio(TWILIO_SID, TWILIO_AUTHTOKEN);
    const verification_check = await client.verify.v2.services(TWILIO_SIRVICEID)
        .verificationChecks
        .create({ to: `+91${phone}`, code: otp });
        
    return verification_check;
}

module.exports = { sendOtp, verifyOtp };

