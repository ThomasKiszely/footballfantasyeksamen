const User = require('../models/teamModel');
const Team = require('../models/teamModel');


async function createTeam(teamData) {
    const teamModel = new teamModel(teamData);
    return await teamModel.save();
}

async function saveTeam(teamData) {
    return await team.save();
}

async function getAllTeams() {
    return await teamModel.find({});
}

async function getTeamById(teamId) {
    return await teamModel.findById(teamId);
}

async function getTeamByName(teamName) {
    teamModel = await teamModel.findOne({teamName});
    return teamModel;
}

async function updateTeam(teamId, projectData) {
    const updatedTeam = teamModel.findOneAndUpdate(teamId, projectData, {new: true, runValidators: true});
    return updatedTeam;
}

async function deleteTeam (teamId) {
    const deleted = await teamModel.findByIdAndDelete(teamId);
    return deleted;
}


module.exports = {
    createTeam,
    saveTeam,
    getAllTeams,
    getTeamById,
    getTeamByName,
    updateTeam,
    deleteTeam,
};