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
const attendanceRoutes = require('./routes/AttendenceRoutes');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger/master_swagger.json');


const app = express();

// Middlewares
app.use(cors({
    origin: ['https://www.safehandlifecare.com', 'https://safehandlifecare.com', 'http://localhost:3000', 'http://localhost:3001', 'https://safehandwebsite.vercel.app'],
    credentials: true
}));
app.use(express.json());
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ limit: "50mb", extended: true }))
app.use(cookieParser());

// Require Routes
const serviceRoutes = require('./routes/serviceRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const subCategoryRoutes = require('./routes/subCategoryRoutes');

const enqueryRoutes = require('./routes/enqueryRoutes');
const workerRoutes = require('./routes/workerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const workerAuthRoutes = require('./routes/workerAuthRoutes');
const jobCartRoutes = require('./routes/jobCartRoutes');
const clientPaymentRoutes = require('./routes/clientPaymentRoutes');
const workerPayoutRoutes = require('./routes/workerPayoutRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const clientRoutes = require('./routes/clientRoutes');
const cartRoutes = require('./routes/cartRoutes');


// API Routing setup
app.use('/api/services', serviceRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/subcategories', subCategoryRoutes);

app.use('/api/enqueries', enqueryRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/worker-auth', workerAuthRoutes);
app.use('/api/jobcards', jobCartRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/payments', clientPaymentRoutes);
app.use('/api/worker-payouts', workerPayoutRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/cart', cartRoutes);


// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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

const { startPaymentReminderCron } = require('./services/paymentReminderService');
//const { startGKQuestionCron } = require('./services/gkQuestionCronService');

server.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    await connectToDatabase();

    // Start background job for payment reminders
    startPaymentReminderCron();

    // Start GK Question cron — ek baar turant + roz 6 AM & 6 PM IST
    // startGKQuestionCron();
});
