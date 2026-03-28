const multer = require("multer");
const multerS3 = require("multer-s3");
const s3 = require("../config/awsconfig");
const serverConfig = require("../config/serverConfig");

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: serverConfig.AWS_BUCKET_NAME,
        contentType: multerS3.AUTO_CONTENT_TYPE, // Isse browser mein file open hogi, download nahi
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);

            // Logic: Agar PDF hai toh 'documents' folder, baki sab 'images' folder mein
            let folder = "others";
            if (file.mimetype === "application/pdf") {
                folder = "documents";
            } else if (file.mimetype.startsWith("image/")) {
                folder = "images";
            }

            cb(null, `${folder}/${uniqueSuffix}-${file.originalname}`);
        }
    }),
    fileFilter: (req, file, cb) => {
        // Sirf Images aur PDFs allow karne ke liye logic
        if (file.mimetype.startsWith("image/") || file.mimetype === "application/pdf") {
            cb(null, true);
        } else {
            cb(new Error("Only Images and PDFs are allowed!"), false);
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 } // Optional: 5MB limit set ki hai
});

module.exports = upload;