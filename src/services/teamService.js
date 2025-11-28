const teamRepo = require('../data/teamRepo');

async function getAllTeams() {
    return teamRepo.getAllTeams();
}

async function getTeamById(id) {
    return teamRepo.getTeamById(id);
}

async function createTeam(teamData) {
    return teamRepo.createTeam(teamData);
}

async function updateTeam(id, updateData) {
    return teamRepo.updateTeam(id, updateData);
}

async function deleteTeam(id) {
    return teamRepo.deleteTeam(id);
}

module.exports = {
    getAllTeams,
    getTeamById,
    createTeam,
    updateTeam,
    deleteTeam,
};