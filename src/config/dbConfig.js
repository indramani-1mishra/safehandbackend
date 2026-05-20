const mongoose = require('mongoose');
const { MONGO_URL } = require('./serverConfig');
const { LOCAL_MONGO_URL } = require('./serverConfig');
const connectToDatabase = async () => {
    try {
        const mode = "dev"; // Change to "production" for production environment
        const url = mode === "local" ? LOCAL_MONGO_URL : MONGO_URL;
        console.log("Connecting to database..." + url);
        await mongoose.connect(url);
        console.log("Database connected successfully");
    } catch (error) {
        console.log("Error connecting to database", error);
    }
}

module.exports = connectToDatabase;
