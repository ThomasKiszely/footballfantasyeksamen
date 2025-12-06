const teamRepo = require("../data/teamRepo");
const footballMatchRepo = require("../data/footballMatchRepo");


async function fetchAllMatches() {
    return footballMatchRepo.saveToDB();
}
async function updateAllTeamsAndGameweek() {
    const allTeams = await teamRepo.getAllTeams();
    console.log(`Starter pointberegning for ${allTeams.length} hold...`);

    for(const team of allTeams) {
        await updateTeamPoints(team._id);
    }
    console.log('Pointberegning fuldført.');
}

function calculatePointsForClub(match, clubName) {
    const normalizedClubName = clubName.toLowerCase().trim();
    const normalizedHomeTeam = match.homeTeam ? match.homeTeam.toLowerCase().trim() : '';
    const normalizedAwayTeam = match.awayTeam ? match.awayTeam.toLowerCase().trim() : '';

    const isHome = normalizedHomeTeam === normalizedClubName;
    const isAway = normalizedAwayTeam === normalizedClubName;

    if(!isHome && !isAway) {
        return 0;
    }

    if(match.winner === 'DRAW') {
        return 1;
    }
    // Tjek for sejr: Sejr giver 3 point
    if(match.winner === 'HOME_TEAM' && isHome) {
        return 3;
    }
    if(match.winner === 'AWAY_TEAM' && isAway) {
        return 3;
    }
    return 0;
}


async function updateTeamPoints(teamId) {
    const team = await teamRepo.getTeamById(teamId);
    let allMatches = await footballMatchRepo.getAllMatches();

    // Vi inkluderer kampe, der har score-data, selvom de ikke er færdige (for at fange live point)
    let scoredMatches = allMatches.filter(match =>
        match.homeScore !== null && match.homeScore !== undefined
    );
    scoredMatches.sort((a, b) => parseInt(a.matchday) - parseInt(b.matchday));

    let detailedGameweekPoints = new Map();

    // --- 1. OPRET DETALJERET POINTKORT (MAP-BASERET) ---
    for (const match of scoredMatches) {
        if (match.matchday === null || match.matchday === undefined) continue;
        const matchday = parseInt(match.matchday);
        const matchdayString = String(matchday);

        let playerPointsMap = detailedGameweekPoints.get(matchdayString);
        if (!playerPointsMap) {
            playerPointsMap = new Map();
            detailedGameweekPoints.set(matchdayString, playerPointsMap);
        }

        for (const player of team.players) {
            const clubPoints = calculatePointsForClub(match, player.club);
            const playerIdString = player._id.toString();

            const existingPoints = playerPointsMap.get(playerIdString) || 0;
            playerPointsMap.set(playerIdString, existingPoints + clubPoints);
        }
    }

    // --- 2. BEREGN TOTAL POINTS (MAP-SUMMERING) ---
    let totalPoints = 0;
    for (const gwPointsMap of detailedGameweekPoints.values()) {
        for (const points of gwPointsMap.values()) {
            totalPoints += parseInt(points);
        }
    }

    // --- 3. LOGIK FOR GAMEWEEK SKIFTE ---
    let latestFinishedGameweek = 0;
    const maxMatchday = allMatches.reduce((max, match) => {
        const matchdayNum = parseInt(match.matchday);
        return matchdayNum > max ? matchdayNum : max;
    }, 0);

    // Find den seneste officielt afsluttede Gameweek (alle kampe er 'FINISHED' eller aflyst)
    for (let currentGW = maxMatchday; currentGW >= 1; currentGW--) {
        const gwMatches = allMatches.filter(match => parseInt(match.matchday) === currentGW);

        const allFinishedOrExcluded = gwMatches.every(match =>
            match.status === 'FINISHED' ||
            match.status === 'POSTPONED' ||
            match.status === 'CANCELLED'
        );

        if (allFinishedOrExcluded && gwMatches.length > 0) {
            latestFinishedGameweek = currentGW;
            break;
        }
    }

    // Sætter den aktuelle Gameweek til den Gameweek, der skal tjekkes/køres
    const activeTransferGameweek = latestFinishedGameweek > 0 ? latestFinishedGameweek + 1 : 1;
    const pointsGameweek = String(latestFinishedGameweek);

    // --- 4. BEREGN FÆRDIGE GAMEWEEK POINT ---
    let latestGameweekPoints = 0;

    if (latestFinishedGameweek > 0) {
        const gwPointsMap = detailedGameweekPoints.get(pointsGameweek);

        if (gwPointsMap) {
            for (const points of gwPointsMap.values()) {
                latestGameweekPoints += parseInt(points);
            }
        }
    }

    // Aktive gameweek points
    let activeGameweekPoints = 0;
    const activeGWPointsMap = detailedGameweekPoints.get(String(activeTransferGameweek));

    // Hvis vi har point-data for den aktive Gameweek (GW 15)
    if (activeGWPointsMap) {
        for (const points of activeGWPointsMap.values()) {
            activeGameweekPoints += parseInt(points);
        }
    }

    // --- 5. OPDATER OG GEM ---
    team.points = totalPoints;
    team.detailedGameweekPoints = detailedGameweekPoints;
    team.latestGameweekPoints = latestGameweekPoints;
    team.currentGameweek = activeTransferGameweek;
    team.activeGameweekPoints = activeGameweekPoints;

    //Gem i databasen
    await teamRepo.updateTeam(teamId, {
        points: totalPoints,
        detailedGameweekPoints: detailedGameweekPoints,
        latestGameweekPoints: latestGameweekPoints,
        currentGameweek: activeTransferGameweek,
        activeGameweekPoints: activeGameweekPoints,
    });


    const freshTeamDocument = await teamRepo.getTeamById(teamId);
    const teamObject = freshTeamDocument.toObject ? freshTeamDocument.toObject() : freshTeamDocument;

    // Sørg for at konvertere Maps tilbage til Objects ved returnering for frontend
    if (teamObject.detailedGameweekPoints && teamObject.detailedGameweekPoints instanceof Map) {
        teamObject.detailedGameweekPoints = Object.fromEntries(teamObject.detailedGameweekPoints);
        for (const gwKey in teamObject.detailedGameweekPoints) {
            let gwEntry = teamObject.detailedGameweekPoints[gwKey];
            if (gwEntry instanceof Map) {
                teamObject.detailedGameweekPoints[gwKey] = Object.fromEntries(gwEntry);
            }
        }
    }

   teamObject.activeGameweekPoints = activeGameweekPoints;

    return teamObject;
}


module.exports = {
    updateTeamPoints,
    calculatePointsForClub,
    fetchAllMatches,
    updateAllTeamsAndGameweek,
}