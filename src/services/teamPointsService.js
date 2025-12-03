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


    let detailedGameweekPoints = {};

    for (const match of matches) {
        if(match.matchday === null || match.matchday === undefined) continue;

        const matchday = parseInt(match.matchday);
        if(isNaN(matchday)) continue;

        const matchdayString = String(matchday);

        // Initialiser Matchday, hvis den ikke eksisterer
        if (!detailedGameweekPoints[matchdayString]) {
            detailedGameweekPoints[matchdayString] = {};
        }

        for(const player of team.players) {
            const clubPoints = calculatePointsForClub(match, player.club);


            if (!detailedGameweekPoints[matchdayString][player._id.toString()]) {
                detailedGameweekPoints[matchdayString][player._id.toString()] = 0;
            }

            // Akkumulér point til den specifikke spiller i den specifikke Gameweek
            detailedGameweekPoints[matchdayString][player._id.toString()] += clubPoints;

            // Opdater total point for hele holdet
            totalPoints += clubPoints;
        }
    }


    let latestMatchday = 0;

    for (const matchdayString in detailedGameweekPoints) {
        const playerPoints = detailedGameweekPoints[matchdayString];


        const gameweekTotal = Object.values(playerPoints).reduce((sum, points) => sum + points, 0);
        const matchdayNumber = parseInt(matchdayString);

        if (gameweekTotal > 0 && matchdayNumber > latestMatchday) {
            latestMatchday = matchdayNumber;
        }
    }

    // Tjekker om gameweek er gyldtigt, at der blevet spillet, hvis den er så regner alle point sammen fra spillerne
    const latestGameweekPoints = latestMatchday > 0
        ? Object.values(detailedGameweekPoints[String(latestMatchday)]).reduce((sum, points) => sum + points, 0)
        : 0;


    team.points = totalPoints;


    team.detailedGameweekPoints = detailedGameweekPoints;
    team.latestGameweekPoints = latestGameweekPoints;

    await teamRepo.updateTeam(teamId, {
        points: totalPoints,
        detailedGameweekPoints: detailedGameweekPoints,
        latestGameweekPoints: latestGameweekPoints
    });

    return team;
}

module.exports = {
    updateTeamPoints,
    calculatePointsForClub,
    fetchAllMatches
}
