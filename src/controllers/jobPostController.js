const jobPostService = require("../services/jobpost");

const createJobPostController = async (req, res) => {
    try {
        // 1. Safe check agar req.files hi missing ho
        if (!req.files || (!req.files.image && !req.files.video)) {
            return res.status(400).json({
                success: false,
                message: "Image or video is required"
            });
        }

        const image = req.files.image;
        const video = req.files.video;

        // 2. Optional Chaining (?.) use karein taaki array index error na aaye
        req.body.image = image && image[0] ? image[0].location : "";
        req.body.video = video && video[0] ? video[0].location : "";

        // 3. Service layer call
        const jobPost = await jobPostService.createPost(req.body);

        // 4. Success Response
        res.status(201).json({
            success: true,
            message: "Job post created successfully",
            data: jobPost
        });

    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
};

const getJobPostByIdController = async (req, res) => {
    try {
        const jobPost = await jobPostService.getPostById(req.params.id);
        res.status(200).json({
            success: true,
            data: jobPost
        });
    } catch (error) {
        res.status(error.statusCode || 404).json({
            success: false,
            message: error.message
        });
    }
};

const getAllJobPostsController = async (req, res) => {
    try {
        const jobPosts = await jobPostService.getAllPosts(req.query);
        res.status(200).json({
            success: true,
            data: jobPosts
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
};

const updateJobPostController = async (req, res) => {
    try {
        const files = req.files || {};
        const image = files.image;
        const video = files.video;

        if (image && image[0]) {
            req.body.image = image[0].location;
        }
        if (video && video[0]) {
            req.body.video = video[0].location;
        }

        const jobPost = await jobPostService.updatePost(req.params.id, req.body);
        res.status(200).json({
            success: true,
            message: "Job post updated successfully",
            data: jobPost
        });
    } catch (error) {
        res.status(error.statusCode || 400).json({
            success: false,
            message: error.message
        });
    }
};

const deleteJobPostController = async (req, res) => {
    try {
        await jobPostService.deletePost(req.params.id);
        res.status(200).json({
            success: true,
            message: "Job post deleted successfully"
        });
    } catch (error) {
        res.status(error.statusCode || 400).json({
            success: false,
            message: error.message
        });
    }
};

const interestJobPostController = async (req, res) => {
    try {
        const { workerId } = req.body;
        if (!workerId) {
            return res.status(400).json({
                success: false,
                message: "workerId is required"
            });
        }
        const updatedPost = await jobPostService.interestPost(req.params.id, workerId);
        res.status(200).json({
            success: true,
            message: "Expressed interest in job post successfully",
            data: updatedPost
        });
    } catch (error) {
        res.status(error.statusCode || 400).json({
            success: false,
            message: error.message
        });
    }
};

const uninterestJobPostController = async (req, res) => {
    try {
        const { workerId } = req.body;
        if (!workerId) {
            return res.status(400).json({
                success: false,
                message: "workerId is required"
            });
        }
        const updatedPost = await jobPostService.uninterestPost(req.params.id, workerId);
        res.status(200).json({
            success: true,
            message: "Removed interest in job post successfully",
            data: updatedPost
        });
    } catch (error) {
        res.status(error.statusCode || 400).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createJobPostController,
    getJobPostByIdController,
    getAllJobPostsController,
    updateJobPostController,
    deleteJobPostController,
    interestJobPostController,
    uninterestJobPostController
};
