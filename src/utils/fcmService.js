const admin = require("../config/FirebaseConfig");

/**
 * Send FCM notification to a specific device or multiple devices.
 * @param {string|string[]} tokens - Single FCM token or array of tokens
 * @param {Object} notification - Notification object { title, body }
 * @param {Object} data - Optional data payload
 */
const sendFcmNotification = async (tokens, notification, data = {}) => {
    try {
        if (!tokens || (Array.isArray(tokens) && tokens.length === 0)) {
            console.log("No FCM tokens provided, skipping notification.");
            return;
        }

        const message = {
            notification: {
                title: notification.title,
                body: notification.body,
            },
            data: {
                ...data,
                click_action: "FLUTTER_NOTIFICATION_CLICK",
            },
            android: {
                priority: "high",
                notification: {
                    sound: "default",
                    channelId: "high_importance_channel",
                    priority: "max",
                },
            },
            apns: {
                payload: {
                    aps: {
                        contentAvailable: true,
                        sound: "default",
                    },
                },
            },
        };

        if (Array.isArray(tokens)) {
            const validTokens = tokens.filter(t => t && t.trim() !== "");
            if (validTokens.length === 0) return;

            const response = await admin.messaging().sendEachForMulticast({
                tokens: validTokens,
                ...message
            });
            console.log(`Successfully sent ${response.successCount} messages; ${response.failureCount} failed.`);
        } else {
            if (!tokens || tokens.trim() === "") return;
            
            const response = await admin.messaging().send({
                token: tokens,
                ...message
            });
            console.log("Successfully sent message:", response);
        }
    } catch (error) {
        console.error("Error sending FCM notification:", error);
    }
};

module.exports = { sendFcmNotification };
