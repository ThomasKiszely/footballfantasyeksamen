const teamRepo = require("../data/teamRepo");
const footballMatchRepo = require("../data/footballMatchRepo");


async function fetchAllMatches() {
    return footballMatchRepo.saveToDB();
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

    let scoredMatches = allMatches.filter(match =>
        match.homeScore !== null && match.homeScore !== undefined
    );
    scoredMatches.sort((a,b) => parseInt(a.matchday) - parseInt(b.matchday));


    let detailedGameweekPoints = new Map(); // Bruger JavaScript Map


    // --- 1. OPRET DETALJERET POINTKORT (MAP-BASERET) ---
    for (const match of scoredMatches) {
        if(match.matchday === null || match.matchday === undefined) continue;

        const matchday = parseInt(match.matchday);
        const matchdayString = String(matchday);

        // Hent det indre Map, eller opret et nyt Map()
        let playerPointsMap = detailedGameweekPoints.get(matchdayString);
        if (!playerPointsMap) {
            playerPointsMap = new Map(); // Bruger indre Map
            detailedGameweekPoints.set(matchdayString, playerPointsMap);
        }

        for(const player of team.players) {
            const clubPoints = calculatePointsForClub(match, player.club);
            const playerIdString = player._id.toString();

            // Brug Map-metoder: .get() og .set()
            const existingPoints = playerPointsMap.get(playerIdString) || 0;
            playerPointsMap.set(playerIdString, existingPoints + clubPoints);
        }
    }

    // --- 2. BEREGN TOTAL POINTS (MAP-SUMMERING MED PARSEINT FIX) ---
    let totalPoints = 0;
    for(const gwPointsMap of detailedGameweekPoints.values()) {
        for(const points of gwPointsMap.values()) {
            totalPoints += parseInt(points);
        }
    }

    // --- 3. LOGIK FOR GAMEWEEK SKIFTE ---

    // Antager vi vil vise point for den seneste scorede GW (GW 14)
    const maxMatchday = allMatches.reduce((max, match) => {
        const matchdayNum = parseInt(match.matchday);
        return matchdayNum > max ? matchdayNum : max;
    }, 0);

    const latestFinishedGameweek = 14;

    const nextActiveGameweek = latestFinishedGameweek > 0 ? latestFinishedGameweek + 1 : 1;


    // --- 4. BEREGN SENESTE GAMEWEEK POINT (MAP-SUMMERING MED PARSEINT FIX) ---
    const pointsGameweek = String(latestFinishedGameweek);
    let latestGameweekPoints = 0;

    if (latestFinishedGameweek > 0) {
        const gwPointsMap = detailedGameweekPoints.get(pointsGameweek);

        if (gwPointsMap) {
            for(const points of gwPointsMap.values()) {
                latestGameweekPoints += parseInt(points);
            }
        }
    }


    // --- 5. OPDATER OG GEM ---

    team.points = totalPoints;
    team.detailedGameweekPoints = detailedGameweekPoints;
    team.latestGameweekPoints = latestGameweekPoints;
    team.currentGameweek = nextActiveGameweek;

    await teamRepo.updateTeam(teamId, {
        points: totalPoints,
        detailedGameweekPoints: detailedGameweekPoints,
        latestGameweekPoints: latestGameweekPoints,
        currentGameweek: nextActiveGameweek
    });


    const freshTeamDocument = await teamRepo.getTeamById(teamId);
    const teamObject = freshTeamDocument.toObject ? freshTeamDocument.toObject() : freshTeamDocument;

    // Sørg for at konvertere Maps tilbage til Objects ved returnering for frontend
    if (teamObject.detailedGameweekPoints && teamObject.detailedGameweekPoints instanceof Map) {
        // Konverter ydre Map til Object
        teamObject.detailedGameweekPoints = Object.fromEntries(teamObject.detailedGameweekPoints);

        // Konverter indre Maps i det nye objekt
        for(const gwKey in teamObject.detailedGameweekPoints) {
            let gwEntry = teamObject.detailedGameweekPoints[gwKey];
            if (gwEntry instanceof Map) {
                teamObject.detailedGameweekPoints[gwKey] = Object.fromEntries(gwEntry);
            }
        }
    }

    return teamObject;
}
module.exports = {
    updateTeamPoints,
    calculatePointsForClub,
    fetchAllMatches
}
