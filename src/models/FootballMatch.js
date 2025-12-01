const mongoose = require('mongoose');

const footballMatchSchema = new mongoose.Schema({
    matchId: { type: Number, required: true, unique: true },
    utcDate: String,
    status: String,
    competition: {
        name: String,
        type: String,
        emblem: String
    },
    season: String,
    matchday: Number,
    homeTeam: String,
    awayTeam: String,
    homeScore: Number,
    awayScore: Number,
    winner: String
});

const FootballMatch = mongoose.model('FootballMatch', footballMatchSchema);
module.exports = FootballMatch;
