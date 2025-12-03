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
    let allMatches = await footballMatchRepo.getAllMatches();


    // Filter kampe fra, der endnu ik er blevet spillet(mangler score)
    // Dette sikrer, at vi kun beregner point for kampe, der har score.
    let scoredMatches = allMatches.filter(match =>
        match.homeScore !== null && match.homeScore !== undefined
    );

    scoredMatches.sort((a,b) => parseInt(a.matchday) - parseInt(b.matchday));

    let totalPoints = 0;


    let detailedGameweekPoints = {};

    for (const match of scoredMatches) {
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

            if (!detailedGameweekPoints[matchdayString][playerIdString]) {
                detailedGameweekPoints[matchdayString][playerIdString] = 0;
            }
            // Akkumulér point til den specifikke spiller i den specifikke Gameweek
            detailedGameweekPoints[matchdayString][playerIdString] += clubPoints;
            // Opdater total point for hele holdet
            totalPoints += clubPoints;
        }
    }

    // Logik for Gameweek skifte

    // FInd den højeste matchday nummer
    const maxMatchday = allMatches.reduce((max, match) => {
        const matchdayNum = parseInt(match.matchday);
        return matchdayNum > max ? matchdayNum : max;
    }, 0);

    let latestFinishedGameweek = 0;

    // Iterer baglæns fra den højeste matchd for at finde den sidste afsluttede gameweek
    for (let currentGW = maxMatchday; currentGW >= 1; currentGW--) {
        // Filtrer kampe for den aktuelle GW
        const gwMatches = allMatches.filter(match => parseInt(match.matchday) === currentGW);

        // Tjekker om kampe er færdige
        const allFinishedOrExcluded = gwMatches.every(match =>
            match.status === 'FINISHED' ||
            match.status === 'POSTPONED' ||
            match.status === 'CANCELLED'
        );

        if(allFinishedOrExcluded && gwMatches.length > 0){
            latestFinishedGameweek = currentGW;
            break; // stop og brug denne GW, da det er den højeste, der helt færdig
        }
    }


    // Den næste Gameweek, der skal spilles, hvis GW 14 er færidg bliver det GW 15
    const nextActiveGameweek = latestFinishedGameweek > 0 ? latestFinishedGameweek + 1 : 1;


    // Brug den sidste *FINISHED* gameweek til at beregne de point, der skal vises i UI
    const pointsGameweek = String(latestFinishedGameweek);


    //  alle point sammenlagt for ens spillere fra den sidste sammenlagt gameweek
    const latestGameweekPoints = latestFinishedGameweek > 0
        ? Object.values(detailedGameweekPoints[pointsGameweek] || {}).reduce((sum, points) => sum + points, 0)
        : 0;



    // Opdaterede point og GW-status
    team.points = totalPoints;
    team.detailedGameweekPoints = detailedGameweekPoints;
    team.latestGameweekPoints = latestGameweekPoints;

    // Sæt den nye aktive Gameweek
    team.currentGameweek = nextActiveGameweek;

    await teamRepo.updateTeam(teamId, {
        points: totalPoints,
        detailedGameweekPoints: detailedGameweekPoints,
        latestGameweekPoints: latestGameweekPoints,
        currentGameweek: nextActiveGameweek
    });


    const freshTeamDocument = await teamRepo.getTeamById(teamId);
    const teamObject = freshTeamDocument.toObject ? freshTeamDocument.toObject() : freshTeamDocument;


    if (teamObject.detailedGameweekPoints && teamObject.detailedGameweekPoints instanceof Map) {
        teamObject.detailedGameweekPoints = Object.fromEntries(teamObject.detailedGameweekPoints);
    }
    // Returnerer det rene objekt til controlleren
    return teamObject;
}

module.exports = {
    updateTeamPoints,
    calculatePointsForClub,
    fetchAllMatches
}
