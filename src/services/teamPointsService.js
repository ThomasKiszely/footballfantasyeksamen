const teamRepo = require("../data/teamRepo");
const footballMatchRepo = require("../data/footballMatchRepo");
const {calculateDetailedPoints} = require("./pointCalculator");
const {determineGameweekStatus} = require("./gameweekManager");

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

function hasScoreData(match) {
    return match.homeScore != null; // tjekker både null og undefined
}

// Hjælper til at konventere Mongoose maps til plain Objects for frontend
function formatTeamOutput(teamDocument, activeGameweekPoints) {
    const teamObject = teamDocument.toObject ? teamDocument.toObject() : teamDocument;

    // Konverter detailedGameweekPoints fra Map til Object
    if (teamObject.detailedGameweekPoints instanceof Map) {
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


async function updateTeamPoints(teamId) {
    // 1. henter data
    const [team, allMatches] = await Promise.all([
        teamRepo.getTeamById(teamId),
        footballMatchRepo.getAllMatches()
    ]);

    // Filtrer kampe med score-data (til pointberegning)
    const scoredMatches = allMatches.filter(hasScoreData);

    // 2. beregner vi detaljernde point
    const detailedGameweekPoints = calculateDetailedPoints(team.players, scoredMatches);

    // 3. bestemmer vi status og lægger det sammen
    const {
        totalPoints,
        latestFinishedGameweek,
        latestGameweekPoints,
        activeTransferGameweek,
        activeGameweekPoints,
    } = determineGameweekStatus(allMatches, detailedGameweekPoints);

    // 4. opdatere og gemmer i databasen
    await teamRepo.updateTeam(teamId, {
        points: totalPoints,
        // Gem Maps direkte i Mongoose, hvis schema tillader det.
        detailedGameweekPoints: detailedGameweekPoints,
        latestGameweekPoints: latestGameweekPoints,
        currentGameweek: activeTransferGameweek,
        activeGameweekPoints: activeGameweekPoints,
    });

    // 5. FORMATER OUTPUT
    const freshTeamDocument = await teamRepo.getTeamById(teamId);
    return formatTeamOutput(freshTeamDocument, activeGameweekPoints);
}


module.exports = {
    updateTeamPoints,
    fetchAllMatches,
    updateAllTeamsAndGameweek,
}