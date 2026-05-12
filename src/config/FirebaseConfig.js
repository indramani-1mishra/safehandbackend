const admin = require("firebase-admin");
const path = require("path");
const { FIREBASE_KEY_PATH } = require("./serverConfig");

if (FIREBASE_KEY_PATH) {
    const absolutePath = path.resolve(FIREBASE_KEY_PATH);
    const serviceAccount = require(absolutePath);
    console.log("Firebase absolutePath", absolutePath);

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
} else {
    console.log("Firebase is disabled because FIREBASE_KEY_PATH is not set in .env");
}

module.exports = admin;