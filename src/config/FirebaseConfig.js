const admin = require("firebase-admin");
const path = require("path");
const { FIREBASE_KEY_PATH } = require("./serverConfig");
const absolutePath = path.resolve(FIREBASE_KEY_PATH);
const serviceAccount = require(absolutePath);
console.log("absolutePath", absolutePath);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});
console.log(admin)

module.exports = admin;