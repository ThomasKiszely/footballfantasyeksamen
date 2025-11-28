const express = require('express');
const app = express();
const path = require('path');
const playerRoutes = require('./routes/playerRoutes');
const router = require('./routes/userRoutes');
const teamRoutes = require('./routes/teamRoutes');
const { notFound } = require('./middlewares/notFound');
const { errorHandler } = require('./middlewares/errorHandler');
const { connectToMongo } = require('./services/db');
const cron = require('node-cron');
const playerRepo = require('./data/playerRepo');
const {fetchAndSyncPlayers} = require('./services/playerService');
connectToMongo();


// Middleware
app.use(express.json());

app.use(express.static(path.join(__dirname, '..', 'public')));

// Routes
app.use('/players', playerRoutes)
app.use('/api/user', router);
app.use('/api/team', teamRoutes);

app.use(notFound);
app.use(errorHandler);


function startDataSync() {
    // Fetch data every 10 minutes
    cron.schedule('*/10 * * * *', async () => {
        console.log('Reading player data from API...');
        await fetchAndSyncPlayers();
    });
}
startDataSync();


module.exports = app;