const mongoose = require('mongoose');
const { MONGO_URL } = require('./serverConfig');

const connectToDatabase = async () => {
    try {
        console.log("Connecting to database..."+MONGO_URL);
        await mongoose.connect(MONGO_URL);
        console.log("Database connected successfully");
    } catch (error) {
        console.log("Error connecting to database", error);
    }
}

module.exports = connectToDatabase;
