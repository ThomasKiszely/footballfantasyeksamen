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
    if(match.winner === 'HOME_TEAM' && isHome) return 3;
    if(match.winner === 'AWAY_TEAM' && isAway) return 3;
    return 0
}


async function updateTeamPoints(teamId) {
    const team = await teamRepo.getTeamById(teamId);
    let matches = await footballMatchRepo.getAllMatches();

    matches = matches.filter(match =>
        match.homeScore !== null && match.homeScore !== undefined
    );

    matches.sort((a,b) => parseInt(a.matchday) - parseInt(b.matchday));

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
            const playerIdString = player._id.toString();

            if(clubPoints > 0) {
                console.log(`Nøgle i pointkort: ${playerIdString}`);
            }
            if (matchday >= 12 && clubPoints > 0) {
                console.log(`GW ${matchday} - SPILLEDER: ${player.name} fik ${clubPoints} point!`);
            }

            if (!detailedGameweekPoints[matchdayString][playerIdString]) {
                detailedGameweekPoints[matchdayString][playerIdString] = 0;
            }

            // Akkumulér point til den specifikke spiller i den specifikke Gameweek
            detailedGameweekPoints[matchdayString][playerIdString] += clubPoints;

            // Opdater total point for hele holdet
            totalPoints += clubPoints;
        }
    }


    let latestMatchday = 0;

    for (const matchdayString in detailedGameweekPoints) {
        const matchdayNumber = parseInt(matchdayString);

        if(matchdayNumber > latestMatchday) {
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
    const freshTeamDocument = await teamRepo.getTeamById(teamId);


    const teamObject = freshTeamDocument.toObject ? freshTeamDocument.toObject() : freshTeamDocument;


    if (teamObject.detailedGameweekPoints && teamObject.detailedGameweekPoints instanceof Map) {
        teamObject.detailedGameweekPoints = Object.fromEntries(teamObject.detailedGameweekPoints);
    }

    return teamObject;
}

module.exports = {
    updateTeamPoints,
    calculatePointsForClub,
    fetchAllMatches
}
