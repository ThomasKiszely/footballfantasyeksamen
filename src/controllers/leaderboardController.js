const leaderboardService = require('../services/leaderboardService');

exports.getLeaderboard = async (req, res, next) => {
    try {
        const leaderboard = await leaderboardService.retrieveLeaderboard();
        res.status(200).json(leaderboard);
    } catch (error) {
        next(error);
    }
};