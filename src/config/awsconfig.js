const { S3Client } = require("@aws-sdk/client-s3");
const serverConfig = require("./serverConfig");

const s3 = new S3Client({
    region: serverConfig.AWS_REGION,
    credentials: {
        accessKeyId: serverConfig.AWS_S3_ACCESS_KEY,
        secretAccessKey: serverConfig.AWS_S3_SECRET_KEY
    }
});

module.exports = s3;