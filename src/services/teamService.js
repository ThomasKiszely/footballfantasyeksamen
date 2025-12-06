const teamRepo = require('../data/teamRepo');
const userRepo = require('../data/userRepo');
const {isInitialTeamValid} = require("../policies/teamPolicy");
const {getDefaultBudget} = require('../config/teamConfig');

async function getAllTeams() {
    return teamRepo.getAllTeams();
}

async function getTeamById(id) {
    return teamRepo.getTeamById(id);
}

async function createTeam(teamData) {
    await isInitialTeamValid(teamData.players, teamData.budget);

    const team = await teamRepo.createTeam(teamData);
    await userRepo.addTeamToUser(teamData.userId, team._id);
    return team;
}
async function getTeamByUserId(userId) {
    return teamRepo.getTeamByUserId(userId);
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
    getTeamByUserId,
    getDefaultBudget,
};