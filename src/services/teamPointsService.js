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
    let pointsPerGameweek = {};

    for (const match of matches) {
        if(match.matchday === null || match.matchday === undefined) continue;

        const matchday = parseInt(match.matchday);
        if(isNaN(matchday)) continue;

        const matchdayString = String(matchday);

        if(!pointsPerGameweek[matchdayString]) {
            pointsPerGameweek[matchdayString] = 0;
        }

        for(const player of team.players) {
            const clubPoints = calculatePointsForClub(match, player.club);
            pointsPerGameweek[matchdayString] += clubPoints;

            totalPoints+= clubPoints;
        }
    }
    let latestMatchday = 0;

    for(const matchdayString in pointsPerGameweek) {
        const points = pointsPerGameweek[matchdayString];
        const matchdayNumber = parseInt(matchdayString);

        if(points > 0 && matchdayNumber > latestMatchday) {
            latestMatchday = matchdayNumber;
        }
    }
    const latestGameweekPoints = pointsPerGameweek[String(latestMatchday)] || 0;

    team.points = totalPoints;
    team.pointsPerGameweek = pointsPerGameweek;
    team.latestGameweekPoints = latestGameweekPoints;

    await teamRepo.updateTeam(teamId, {points: totalPoints, pointsPerGameweek: pointsPerGameweek, latestGameweekPoints: latestGameweekPoints });
    return team;
}

module.exports = {
    updateTeamPoints,
    calculatePointsForClub,
    fetchAllMatches
}
