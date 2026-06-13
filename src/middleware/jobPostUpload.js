const multer = require("multer");
const multerS3 = require("multer-s3");
const s3 = require("../config/awsconfig");
const serverConfig = require("../config/serverConfig");

const uploadJobPost = multer({
    storage: multerS3({
        s3: s3,
        bucket: serverConfig.AWS_BUCKET_NAME,
        acl: undefined,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);

            let folder = "others";
            if (file.mimetype.startsWith("image/")) {
                folder = "images";
            } else if (file.mimetype.startsWith("video/")) {
                folder = "videos";
            }

            cb(null, `${folder}/${uniqueSuffix}-${file.originalname}`);
        }
    }),
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
            cb(null, true);
        } else {
            cb(new Error("Only Images and Videos are allowed for job posts!"), false);
        }
    },
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

module.exports = uploadJobPost;
