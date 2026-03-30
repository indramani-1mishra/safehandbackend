const express = require('express');
const { PORT } = require('./config/serverConfig');
const connectToDatabase = require('./config/dbConfig');
const app = express();

// Middlewares for parsing request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Require Routes
const serviceRoutes = require('./routes/serviceRoutes');
const enqueryRoutes = require('./routes/enqueryRoutes');
const adminRoutes = require('./routes/adminRoutes');

// API Routing setup
app.use('/api/services', serviceRoutes);
app.use('/api/enqueries', enqueryRoutes);
app.use('/api/admins', adminRoutes);

app.get("/", (req, res) => {
    res.send(`<h1>Server is running..... ${PORT}</h1>`);
});

app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    await connectToDatabase();
});
