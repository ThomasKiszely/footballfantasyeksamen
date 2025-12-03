const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const teamSchema = new mongoose.Schema({
    teamName: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    players: {
        type: [{ type: Schema.Types.ObjectId, ref: 'Player' }], required: true,
    },
    budget: { type: Number, required: true, default: 90000000 },
    points: { type: Number, required: true, default: 0 },
    latestGameweekPoints: { type: Number, default: 0 },
    detailedGameweekPoints: {
        type: Map,
        of: {
            type: Map,
            of: Number,
        },
        default: {}
    },
});

module.exports = mongoose.models.Team || mongoose.model('Team', teamSchema);