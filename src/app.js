const express = require('express');
const app = express();
const path = require('path');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const playerRoutes = require('./routes/playerRoutes');
const router = require('./routes/userRoutes');
const teamRoutes = require('./routes/teamRoutes');
const adminRoutes = require('./routes/adminRoutes');
const transferRoutes = require('./routes/transferRoutes');
const { notFound } = require('./middlewares/notFound');
const { errorHandler } = require('./middlewares/errorHandler');
const { connectToMongo } = require('./services/db');
const cron = require('node-cron');
const {fetchAndSyncPlayers} = require('./services/playerService');
const  teamPointsService = require('./services/teamPointsService');
const cookieParser = require('cookie-parser');
const authToken = require('./middlewares/authMiddleware');
connectToMongo();

app.use(cookieParser());
app.use(express.json());
app.get('/create-team', authToken ,(req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'create-team.html'));
});
app.get('/team', authToken, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'team.html'));
});
app.get('/editUser', authToken, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'editUser.html'));
});
app.get('/admin', authToken, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'admin.html'));
});
app.use(express.static(path.join(__dirname, '..', 'public'), { extensions: ['html'] }));

// Routes
app.use('/api/players', playerRoutes)
app.use('/api/user', router);

app.use('/api/transfers', transferRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFound);
app.use(errorHandler);


function startDataSync() {
    // Fetch data every 10 minutes
    cron.schedule('*/10 * * * *', async () => {
        console.log('Reading player data and alle matches from API...');
        await fetchAndSyncPlayers();

        await teamPointsService.fetchAllMatches();

        await teamPointsService.updateAllTeamsAndGameweek();
    });
}
startDataSync();

module.exports = app;