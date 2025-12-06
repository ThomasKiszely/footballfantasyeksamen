const playerService = require('../services/playerService');

const {
    getDefaultBudget,
    MAX_PLAYERS_PER_CLUB,
    MAX_PLAYERS_TOTAL
} = require('../config/teamConfig');

function isClubLimitExceeded(currentTeamPlayers, newPlayerClub) {
    if(!newPlayerClub) {
        return false;
    }

    const targetClub = newPlayerClub.toLowerCase().trim();

    const count = currentTeamPlayers.filter(player => player.club.toLowerCase().toString() === targetClub).length;

    return count >= MAX_PLAYERS_PER_CLUB;
}

async function isInitialTeamValid(playerIds, sentBudget) {
    if(playerIds.length !== MAX_PLAYERS_TOTAL) {
        throw new Error(`Holdet skal have præcis ${MAX_PLAYERS_TOTAL} spillere.`);
    }

    const players = await playerService.findManyByIds(playerIds);

    const clubCount = {};
    let currentCost = 0;

    for(const player of players) {
        const clubname = player.club.toLowerCase().trim();
        clubCount[clubname] = (clubCount[clubname] || 0) + 1;

        if(clubCount[clubname] > MAX_PLAYERS_PER_CLUB) {
            throw new Error(`Holdet må kun have ${MAX_PLAYERS_PER_CLUB} spillere fra samme klub. Klub ${player.club} bryder reglen.`);
        }
        currentCost += player.price;
    }

    const maxStartBudget = getDefaultBudget();
    if(currentCost > maxStartBudget) {
        const overskud = ((currentCost - maxStartBudget) / 1000000).toFixed(1);
        throw new Error(`Holdets værdi (${(currentCost / 1000000).toFixed(1)}M) overskrider startbudgettet (${(maxStartBudget / 1000000).toFixed(1)}M) med ${overskud}M.`);
    }

    const calculatedRemaining = maxStartBudget - currentCost;
    if (calculatedRemaining !== sentBudget) {
        console.warn(`Budget mismatch: Frontend sendte ${sentBudget}, men backend beregnede ${calculatedRemaining}.`);
    }
}
module.exports = {
    isClubLimitExceeded,
    MAX_PLAYERS_PER_CLUB,
    MAX_PLAYERS_TOTAL,
    isInitialTeamValid,
}