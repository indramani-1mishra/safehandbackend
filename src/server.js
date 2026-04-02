const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { PORT } = require('./config/serverConfig');
const connectToDatabase = require('./config/dbConfig');
const { createDefaultAdmin } = require('./controllers/createAdminController');
const authRoutes = require('./routes/adminAuthRoutes');
const socketUtils = require('./utils/socket');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Require Routes
const serviceRoutes = require('./routes/serviceRoutes');
const enqueryRoutes = require('./routes/enqueryRoutes');
const workerRoutes = require('./routes/workerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const workerAuthRoutes = require('./routes/workerAuthRoutes');
const jobCartRoutes = require('./routes/jobCartRoutes');

// API Routing setup
app.use('/api/services', serviceRoutes);
app.use('/api/enqueries', enqueryRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/worker-auth', workerAuthRoutes);
app.use('/api/jobcards', jobCartRoutes);

// Test Route for Socket.io
app.get("/test", (req, res) => {
    res.sendFile(path.join(__dirname, '../test-socket.html'));
});

app.get("/", (req, res) => {
    res.send(`<h1>Server is running..... ${PORT}</h1>`);
});

const server = http.createServer(app);

// Initialize Socket.io
socketUtils.init(server);

createDefaultAdmin();

server.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    await connectToDatabase();
});
