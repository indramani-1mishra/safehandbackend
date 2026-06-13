const mongoose = require("mongoose");
const jobRepo = require("../repository/jobPostRepository");
const workerRepo = require("../repository/workerRepository");
const Worker = require("../modals/workerModel");
const { sendFcmNotification } = require("../utils/fcmService");
const { sendJobPostNotification } = require("../utils/sendWhatsappPdf");
const AppError = require("../utils/AppError");

// Helper to chunk arrays (for FCM multicast limit)
const chunkArray = (array, size) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
};

const parseServices = (services) => {
    if (!services) return [];
    if (Array.isArray(services)) return services;
    if (typeof services === 'string') {
        const trimmed = services.trim();
        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
            try {
                return JSON.parse(trimmed);
            } catch (e) {
                return [trimmed];
            }
        }
        if (trimmed.includes(',')) {
            return trimmed.split(',').map(s => s.trim());
        }
        return [trimmed];
    }
    return [];
};

const createPost = async (data) => {
    try {
        const { caption, image, video, services } = data;
        if (!caption) {
            throw new AppError("Caption is required", 400);
        }
        if (!image && !video) {
            throw new AppError("Image or video is required", 400);
        }

        const servicesArray = parseServices(services);

        const jobPost = await jobRepo.createJobPost({
            caption,
            image,
            video,
            services: servicesArray
        });

        // Query active, free (not busy) workers who possess the selected service
        const workerQuery = { isActive: true, isBusy: false };
        if (servicesArray.length > 0) {
            workerQuery.services = { $in: servicesArray };
        }

        const workers = await Worker.find(
            workerQuery,
            "name phone fcmToken"
        ).lean();

        // 1. Send FCM Push Notifications (Chunked by 500)
        const fcmTokens = workers
            .map(w => w.fcmToken)
            .filter(token => token && token.trim() !== "");

        if (fcmTokens.length > 0) {
            const tokenChunks = chunkArray(fcmTokens, 500);
            for (const chunk of tokenChunks) {
                await sendFcmNotification(
                    chunk,
                    {
                        title: "New Job Post 📢",
                        body: caption
                    },
                    {
                        jobPostId: jobPost._id.toString(),
                        type: "new_job_post"
                    }
                ).catch(err => console.error("Error sending FCM chunk:", err));
            }
        }

        // 2. Send WhatsApp Notifications in the background so it doesn't block the API response
        workers.forEach(worker => {
            if (worker.phone) {
                sendJobPostNotification(worker.phone, {
                    caption: caption,
                    workername: worker.name,
                    imageurl: image || video || ""
                }).catch(err => console.error(`WhatsApp notification failed for ${worker.phone}:`, err));
            }
        });

        return jobPost;
    } catch (error) {
        throw error;
    }
};

const getPostById = async (id) => {
    try {
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError("Invalid or missing Job Post ID", 400);
        }
        const post = await jobRepo.getJobPostById(id);
        if (!post) {
            throw new AppError("Job Post not found", 404);
        }
        return post;
    } catch (error) {
        throw error;
    }
};

const getAllPosts = async (query) => {
    try {
        return await jobRepo.getAllJobPosts(query);
    } catch (error) {
        throw error;
    }
};

const updatePost = async (id, data) => {
    try {
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError("Invalid or missing Job Post ID", 400);
        }
        if (data.services) {
            data.services = parseServices(data.services);
        }
        const updatedPost = await jobRepo.updateJobPost(id, data);
        if (!updatedPost) {
            throw new AppError("Job Post not found", 404);
        }
        return updatedPost;
    } catch (error) {
        throw error;
    }
};

const deletePost = async (id) => {
    try {
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError("Invalid or missing Job Post ID", 400);
        }
        const deletedPost = await jobRepo.deleteJobPost(id);
        if (!deletedPost) {
            throw new AppError("Job Post not found", 404);
        }
        return deletedPost;
    } catch (error) {
        throw error;
    }
};

const interestPost = async (jobPostId, workerId) => {
    try {
        if (!jobPostId || !mongoose.Types.ObjectId.isValid(jobPostId)) {
            throw new AppError("Invalid or missing Job Post ID", 400);
        }
        if (!workerId || !mongoose.Types.ObjectId.isValid(workerId)) {
            throw new AppError("Invalid or missing Worker ID", 400);
        }

        // Verify worker exists before registering interest
        const worker = await workerRepo.findWorkerById(workerId);
        if (!worker) {
            throw new AppError("Worker not found", 404);
        }

        const updatedPost = await jobRepo.addWorkerToInterested(jobPostId, workerId);
        if (!updatedPost) {
            throw new AppError("Job Post not found", 404);
        }
        return updatedPost;
    } catch (error) {
        throw error;
    }
};

const uninterestPost = async (jobPostId, workerId) => {
    try {
        if (!jobPostId || !mongoose.Types.ObjectId.isValid(jobPostId)) {
            throw new AppError("Invalid or missing Job Post ID", 400);
        }
        if (!workerId || !mongoose.Types.ObjectId.isValid(workerId)) {
            throw new AppError("Invalid or missing Worker ID", 400);
        }

        // Verify worker exists before removing interest
        const worker = await workerRepo.findWorkerById(workerId);
        if (!worker) {
            throw new AppError("Worker not found", 404);
        }

        const updatedPost = await jobRepo.removeWorkerFromInterested(jobPostId, workerId);
        if (!updatedPost) {
            throw new AppError("Job Post not found", 404);
        }
        return updatedPost;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    createPost,
    getPostById,
    getAllPosts,
    updatePost,
    deletePost,
    interestPost,
    uninterestPost
};