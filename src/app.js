const express = require('express');
const app = express();
const path = require('path');
const router = require('./routes/userRoutes');
const { notFound } = require('./middlewares/notFound');
const { errorHandler } = require('./middlewares/errorHandler');
const { connectToMongo } = require('./services/db');
const cron = require('node-cron');
const playerRepo = require('./data/playerRepo');
connectToMongo();


// Middleware
app.use(express.json());

app.use(express.static(path.join(__dirname, '..', 'public')));

// Routes
app.use('/api/user', router);

app.use(notFound);
app.use(errorHandler);



function startDataSync() {
    // Fetch data every 10 minutes
    cron.schedule('*/10 * * * *', async () => {
        console.log('Reading player data from API...');
        await playerRepo.callPlayersApi();
    });
}
startDataSync();

module.exports = app;