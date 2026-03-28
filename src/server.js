const express = require('express');
const { PORT } = require('./config/serverConfig');
const connectToDatabase = require('./config/dbConfig');
const app = express();

app.get("/", (req, res) => {
    res.send(`<h1>Server is running..... ${PORT}</h1>`);
});

app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    await connectToDatabase();
});


