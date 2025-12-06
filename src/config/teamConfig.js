const Team = require('../models/teamModel');

function getDefaultBudget() {

    if (!Team.schema || !Team.schema.path('budget')) {
        throw new Error("Team model eller budget path ikke fundet.");
    }
    const teamSchema = Team.schema.path('budget');
    return teamSchema.default();
}

const MAX_PLAYERS_PER_CLUB = 3;
const MAX_PLAYERS_TOTAL = 11;

module.exports = {
    getDefaultBudget,
    MAX_PLAYERS_PER_CLUB,
    MAX_PLAYERS_TOTAL,
};