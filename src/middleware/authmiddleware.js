const jwt = require("jsonwebtoken");
const { JWT_SECRET, NODE_ENV } = require("../config/serverConfig");

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
    const token = req.cookies.adminToken;
    const workerToken = req.cookies.workerAccessToken;
    console.log("token", token);
    console.log("workerToken", workerToken);
    if (token) {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.admin = decoded;
        return next();
    }
    if (workerToken) {
        const decoded = jwt.verify(workerToken, JWT_SECRET);
        req.worker = decoded;

        return next();
    }

    return res.status(403).json({ message: "Unauthorized" });
};

const clientAuthMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.clientAccessToken;
        if (!token) {
            return res.status(401).json({ success: false, message: "Authentication required. Please login." });
        }
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Invalid or expired session. Please login again." });
    }
}

const optionalClientAuthMiddleware = async (req, res, next) => {
    try {
        let token = req.cookies?.clientAccessToken;
        if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        }
        
        if (token) {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;
        }
    } catch (error) {
        // Silently ignore errors (e.g. expired token or no token) to allow public access
    }
    next();
}

module.exports = {
    authMiddleware,
    isAdmin,
    workerAuthMiddleware,
    allowAnyAuth,
    clientAuthMiddleware,
    optionalClientAuthMiddleware
};