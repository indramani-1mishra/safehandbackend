const crypto = require('crypto');
const { WHAT_MESSAGE_SECRET } = require('../config/serverConfig');

const generateSecureOtp = () => {
    return crypto.randomInt(100000, 1000000).toString();
}

const SALT = WHAT_MESSAGE_SECRET;
const hashOtp = (otp) => {
    return crypto.createHash('sha256')
        .update(otp + SALT)
        .digest('hex');
};
const verifyOtp = (userProvidedOtp, hashedOtpInDb) => {
    const hashedInput = hashOtp(userProvidedOtp);
    return hashedInput === hashedOtpInDb;
};

module.exports = { generateSecureOtp, hashOtp, verifyOtp };