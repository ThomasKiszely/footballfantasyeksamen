const teamRepo = require("../data/teamRepo");
const footballMatchRepo = require("../data/footballMatchRepo");


async function fetchAllMatches() {
    return footballMatchRepo.saveToDB();
}

function calculatePointsForClub(match, clubName) {
    const isHome = match.homeTeam === clubName;
    const isAway = match.awayTeam === clubName;

    if(!isHome && !isAway) return 0;

    if(match.winner === 'DRAW') return 1;
    if(match.winner === 'HOME_TEAM') return 3;
    if(match.winner === 'AWAY_TEAM') return 3;
    return 0
}


async function updateTeamPoints(teamId) {
    const team = await teamRepo.getTeamById(teamId);
    const matches = await footballMatchRepo.getAllMatches();

    let totalPoints = 0;
    for (const match of matches) {
        for(const player of team.players) {
            totalPoints += calculatePointsForClub(match, player.club);
        }
    }
    team.points = totalPoints;
    await teamRepo.updateTeam(teamId, {points: totalPoints});
    return team;
}

module.exports = {
    updateTeamPoints,
    calculatePointsForClub,
    fetchAllMatches
}
