const { PutObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("../config/awsconfig");
const { AWS_BUCKET_NAME, AWS_REGION } = require("../config/serverConfig");

const uploadPdfToS3 = async (pdfBuffer, fileName) => {
    try {
        const params = {
            Bucket: AWS_BUCKET_NAME,
            Key: `jobcards/${Date.now()}_${fileName}`,
            Body: pdfBuffer,
            ContentType: "application/pdf"
        };

        const command = new PutObjectCommand(params);
        await s3.send(command);

        const url = `https://${AWS_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${params.Key}`;
        return url;
    } catch (error) {
        console.error(" Failed to upload PDF to S3:", error);
        throw error;
    }
};

module.exports = {
    uploadPdfToS3
};
