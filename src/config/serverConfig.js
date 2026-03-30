require("dotenv").config();


const PORT = process.env.PORT || 3000;
const MONGO_URL = process.env.MONGO_URL;
const COMPASS_URL = process.env.COMPASS_URL;
const AWS_S3_ACCESS_KEY = process.env.AWS_S3_ACCESS_KEY;
const AWS_S3_SECRET_KEY = process.env.AWS_S3_SECRET_KEY;
const AWS_REGION = process.env.AWS_REGION;
const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME;
const JWT_SECRET = process.env.JWT_SECRET_KEY || process.env.JWT_SECRET;
const NODE_ENV = process.env.NODE_ENV;

module.exports = {
    PORT,
    MONGO_URL,
    COMPASS_URL,
    AWS_S3_ACCESS_KEY,
    AWS_S3_SECRET_KEY,
    AWS_REGION,
    AWS_BUCKET_NAME,
    JWT_SECRET,
    NODE_ENV
}