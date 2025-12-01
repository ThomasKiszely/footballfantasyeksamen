const leaderboardService = require('../services/leaderboardService');

exports.getLeaderboard = async (req, res) => {
    try {
        const leaderboard = await leaderboardService.retrieveLeaderboard();
        res.status(200).json(leaderboard);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};