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


// Funktion til at tildele spillere point
function calculateDetailedPoints(teamPlayers, scoredMatches) {
    const detailedGameweekPoints = new Map();

    // Sortering sikrer, at point akummleres i en korrekt rækkefølge
    scoredMatches.sort((a, b) => parseInt(a.matchday) - parseInt(b.matchday));

    for(const match of scoredMatches) {
        // Behandler kun kmape med en valid GW
        if(!match.matchday) continue;

        // Konventerer til String
        const matchdayString = String(match.matchday);

        // Opretter for GW, hvis den ik findes
        let playerPointsMap = detailedGameweekPoints.get(matchdayString);
        if(!playerPointsMap) {
            playerPointsMap = new Map();
            detailedGameweekPoints.set(matchdayString, playerPointsMap);
        }

        // Tildeler point til spiller på holdet
        for(const player of teamPlayers) {
            const clubPoints = calculatePointsForClub(match, player.club);
            const playerIdString = player._id.toString();

            // Akkumulerer point
            const existingPoints = playerPointsMap.get(playerIdString) || 0;
            playerPointsMap.set(playerIdString, existingPoints + clubPoints);
        }
    }
    return detailedGameweekPoints;
}

module.exports = {
    calculateDetailedPoints,
}