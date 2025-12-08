
function determineGameweekStatus(allMatches, detailedGameweekPoints) {

    // 1. Find den seneste færdige gameweek
    const maxMatchday = allMatches.reduce((max, match) => {
        const matchdayNum = parseInt(match.matchday);
        return matchdayNum > max ? matchdayNum : max;
    }, 0);

    let latestFinishedGameweek = 0;
    for(let currentGW = maxMatchday; currentGW >= 1; currentGW--) {
        const gwMatches = allMatches.filter(match => parseInt(match.matchday) === currentGW);

        const allFinishedOrExcluded = gwMatches.every(match =>
            match.status === 'FINISHED' || match.status === 'POSTPONED' || match.status === 'CANCELLED'
        );

        if(allFinishedOrExcluded && gwMatches.length > 0) {
            latestFinishedGameweek = currentGW;
            break;
        }
    }
    // 2. Bestem aktive GW numre
    const activeTransferGameweek = latestFinishedGameweek > 0 ? latestFinishedGameweek + 1 : 1;
    const pointGameweek = String(latestFinishedGameweek);
    const activeGameweekString = String(activeTransferGameweek);

    // 3. Summer point
    let totalPoints = 0;
    let latestGameweekPoints = 0;
    let activeGameweekPoints = 0;

    for(const [gwString, gwPointsMap] of detailedGameweekPoints.entries()) {
        let gwTotal = 0;
        for(const points of gwPointsMap.values()) {
            gwTotal += parseInt(points);
        }
        totalPoints += gwTotal;

        if(gwString === pointGameweek) {
            latestGameweekPoints = gwTotal;
        }
        if(gwString === activeGameweekString) {
            activeGameweekPoints = gwTotal;
        }
    }
    return {
        totalPoints,
        latestFinishedGameweek,
        latestGameweekPoints,
        activeTransferGameweek,
        activeGameweekPoints,
    };
}

module.exports = {
    determineGameweekStatus,
}