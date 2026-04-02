let io;

module.exports = {
    init: (server) => {
        io = require("socket.io")(server, {
            cors: {
                origin: "*", // Adjust this later for security
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


            // Admin joins admin room
            socket.on("join_admin", () => {
                socket.join("admin_room");
                console.log(" Admin joined room: admin_room");
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
