const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/serverConfig");

let io;

function parseCookies(cookieHeader) {
    if (!cookieHeader) return {};
    const list = {};
    cookieHeader.split(';').forEach(cookie => {
        let parts = cookie.split('=');
        list[parts.shift().trim()] = decodeURI(parts.join('='));
    });
    return list;
}

module.exports = {
    init: (server) => {
        io = require("socket.io")(server, {
            cors: {
                origin: [
                    'https://www.safehandlifecare.com',
                    'https://safehandlifecare.com',
                    'http://localhost:3000',
                    'https://safehandwebsite.vercel.app'
                ],
                credentials: true,
                methods: ["GET", "POST"]
            }
        });

        io.on("connection", (socket) => {
            console.log(` New Client Connected: ${socket.id}`);

            // Worker joins their private room based on workerId
            socket.on("join_worker", (workerId) => {
                if (workerId) {
                    socket.join(workerId.toString());
                    console.log(`👷 Worker joined room: ${workerId}`);
                }
            });

            socket.on("joinjobRoom", (jobCardId) => {
                if (jobCardId) {
                    socket.join("job" + jobCardId.toString());
                    console.log(`jobcard room : job${jobCardId}`);
                }
            })


            // Admin joins admin room (Requires verification)
            socket.on("join_admin", (tokenFromClient) => {
                try {
                    const cookieHeader = socket.handshake.headers.cookie;
                    const cookies = parseCookies(cookieHeader);
                    const token = tokenFromClient || cookies.adminToken || socket.handshake.query?.adminToken;
                    
                    if (!token) {
                        console.log("Unauthorized: join_admin failed - No token found");
                        socket.emit("auth_error", { message: "Unauthorized: No token found" });
                        return;
                    }

                    const decoded = jwt.verify(token, JWT_SECRET);
                    if (decoded && decoded.role === "admin") {
                        socket.join("admin_room");
                        console.log(` Admin joined room: admin_room (User ID: ${decoded.id || decoded.name})`);
                        socket.emit("auth_success", { message: "Successfully joined admin room" });
                    } else {
                        console.log("Forbidden: join_admin failed - User role is not admin");
                        socket.emit("auth_error", { message: "Forbidden: Not an admin" });
                    }
                } catch (err) {
                    console.log("Unauthorized: join_admin failed - Invalid token", err.message);
                    socket.emit("auth_error", { message: "Unauthorized: Invalid token" });
                }
            });

            socket.on("disconnect", () => {
                console.log(" Client Disconnected");
            });
        });

        return io;
    },

    getIo: () => {
        if (!io) {
            throw new Error("Socket.io not initialized!");
        }
        return io;
    }
};
