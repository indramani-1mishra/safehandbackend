const crypto = require("crypto");
const Worker = require("../modals/workerModel");
const Client = require("../modals/clientModel");
const LocationLog = require("../modals/locationLogModel");
const { sendSilentFcmMessage } = require("../utils/fcmService");
const socketUtils = require("../utils/socket");

const requestLocation = async (req, res) => {
    try {
        const { targetId, targetType } = req.body;

        if (!targetId || !targetType) {
            return res.status(400).json({ success: false, message: "targetId and targetType are required" });
        }

        if (!['Worker', 'Client'].includes(targetType)) {
            return res.status(400).json({ success: false, message: "Invalid targetType. Must be 'Worker' or 'Client'" });
        }

        let target = null;
        if (targetType === 'Worker') {
            target = await Worker.findById(targetId);
        } else {
            target = await Client.findById(targetId);
        }

        if (!target) {
            return res.status(404).json({ success: false, message: `${targetType} not found` });
        }

        if (!target.fcmToken || target.fcmToken.trim() === "") {
            return res.status(400).json({ success: false, message: "FCM Token not registered for this device. Device is offline." });
        }

        const requestId = crypto.randomUUID();

        // Send silent FCM message to trigger background location fetch
        await sendSilentFcmMessage(target.fcmToken, {
            action: "GET_LOCATION",
            requestId: requestId,
            targetId: targetId.toString(),
            targetType: targetType
        });

        res.status(200).json({
            success: true,
            message: "Location request dispatched successfully",
            data: { requestId }
        });
    } catch (error) {
        console.error("Error in requestLocation controller:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const reportLocation = async (req, res) => {
    try {
        const { requestId, targetId, targetType, latitude, longitude } = req.body;

        if (!requestId || !targetId || !targetType || latitude === undefined || longitude === undefined) {
            return res.status(400).json({ success: false, message: "Missing required fields in request body" });
        }

        // Save location log to database
        const log = await LocationLog.create({
            requestId,
            targetId,
            targetType,
            latitude,
            longitude,
            requestedBy: req.user ? req.user.id : null // Set if request has auth user
        });

        // Broadcast coordinates to the active socket Admin Room
        try {
            const io = socketUtils.getIo();
            io.to("admin_room").emit("location_received", {
                requestId,
                targetId,
                targetType,
                latitude,
                longitude,
                timestamp: log.createdAt
            });
        } catch (socketError) {
            console.error("Failed to broadcast location via socket:", socketError.message);
        }

        res.status(200).json({ success: true, message: "Location reported successfully" });
    } catch (error) {
        console.error("Error in reportLocation controller:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getLatestLocation = async (req, res) => {
    try {
        const { targetId, targetType } = req.query;

        if (!targetId || !targetType) {
            return res.status(400).json({ success: false, message: "targetId and targetType are required" });
        }

        if (!['Worker', 'Client'].includes(targetType)) {
            return res.status(400).json({ success: false, message: "Invalid targetType. Must be 'Worker' or 'Client'" });
        }

        const latestLog = await LocationLog.findOne({ targetId, targetType })
            .sort({ createdAt: -1 });

        if (!latestLog) {
            return res.status(200).json({ success: true, message: "No location log found", data: null });
        }

        res.status(200).json({
            success: true,
            data: {
                latitude: latestLog.latitude,
                longitude: latestLog.longitude,
                timestamp: latestLog.createdAt
            }
        });
    } catch (error) {
        console.error("Error in getLatestLocation controller:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    requestLocation,
    reportLocation,
    getLatestLocation
};
