const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/serverConfig");

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.adminToken;
        if (!token) {
            return res.status(401).json({ message: "No token found or invalid format, Unauthorized" });
        }
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized", error: error.message });
    }
}

const isAdmin = (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "User not authenticated" });
        }
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Forbidden" });
        }
        return next();

    } catch (error) {
        return res.status(401).json({ message: "Unauthorized", error: error.message });
    }
}

const workerAuthMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.workerAccessToken;
        if (!token) {
            return res.status(401).json({ message: "No token found or invalid format, Unauthorized" });
        }
        const decoded = jwt.verify(token, JWT_SECRET);
        req.worker = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized", error: error.message });
    }
}

const allowAnyAuth = (req, res, next) => {
    console.log(req.worker, req.admin);
    if (req.worker || req.admin) {
        return next();
    }
    return res.status(403).json({ message: "Unauthorized" });
};

module.exports = {
    authMiddleware,
    isAdmin,
    workerAuthMiddleware,
    allowAnyAuth
};