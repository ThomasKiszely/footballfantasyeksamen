const mongoose = require('mongoose');

const footballMatchSchema = new mongoose.Schema({
    matchId: {type: Number, required: true, unique: true},
    utcDate: {type: Date, required: true},
    status: {type: String, required: true},
    competition: {
        name: {type: String},
        type: {type: String},
        emblem: {type: String},
    },
    season: {type: String},
    matchday: {type: Number},
    homeTeam: {type: String, required: true},
    awayTeam: {type: String, required: true},
    homeScore: {type: Number, default: null},
    awayScore: {type: Number, default: null},
}, {
    timestamps: true,
});

const FootballMatch = mongoose.model('FootballMatch', footballMatchSchema);
module.exports = FootballMatch;
