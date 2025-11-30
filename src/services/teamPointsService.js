const teamRepo = require("../data/teamRepo");
const footballMatchRepo = require("../data/footballMatchRepo");

function calculatePointsForClub(match, clubName) {
    if(match.winner === 'DRAW') return 1;
    if(match.winner === 'HOME_TEAM' && match.homeTeam === clubName) return 3;
    if(match.winner === 'AWAY_TEAM' && match.awayTeam === clubName) return 3;
    return 0;
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
}
