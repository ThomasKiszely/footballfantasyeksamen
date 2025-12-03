const teamRepo = require('../data/teamRepo');
const userRepo = require('../data/userRepo');
const Team = require('../models/teamModel');

function getDefaultBudget() {
    const teamSchema = Team.schema.path('budget');
    return teamSchema.default();
}

async function getAllTeams() {
    return teamRepo.getAllTeams();
}

async function getTeamById(id) {
    return teamRepo.getTeamById(id);
}

async function createTeam(teamData) {
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