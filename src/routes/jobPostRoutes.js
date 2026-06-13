const express = require("express");
const router = express.Router();
const { authMiddleware, isAdmin, allowAnyAuth } = require("../middleware/authmiddleware");
const uploadJobPost = require("../middleware/jobPostUpload");
const {
    createJobPostController,
    getJobPostByIdController,
    getAllJobPostsController,
    updateJobPostController,
    deleteJobPostController,
    interestJobPostController,
    uninterestJobPostController
} = require("../controllers/jobPostController");

// Admin operations
router.post(
    "/", 
    authMiddleware, 
    isAdmin, 
    uploadJobPost.fields([
        { name: "image", maxCount: 1 },
        { name: "video", maxCount: 1 }
    ]), 
    createJobPostController
);

router.put(
    "/:id", 
    authMiddleware, 
    isAdmin, 
    uploadJobPost.fields([
        { name: "image", maxCount: 1 },
        { name: "video", maxCount: 1 }
    ]), 
    updateJobPostController
);

router.delete("/:id", authMiddleware, isAdmin, deleteJobPostController);

// Shared / Worker operations
router.get("/", allowAnyAuth, getAllJobPostsController);
router.get("/:id", allowAnyAuth, getJobPostByIdController);
router.post("/:id/interest", allowAnyAuth, interestJobPostController);
router.post("/:id/uninterest", allowAnyAuth, uninterestJobPostController);

module.exports = router;
