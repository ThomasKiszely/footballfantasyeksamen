const footballMatchRepo = require("../data/footballMatchRepo");

async function fetchAllMatches() {
    return footballMatchRepo.saveToDB();
}

async function updateFootballMatch(matchId, updateData) {
    return footballMatchRepo.updateMatch(matchId, updateData);
}

async function getAllMatches() {
    return footballMatchRepo.getAllMatches();
}

module.exports = {
    fetchAllMatches,
    updateFootballMatch,
    getAllMatches
};