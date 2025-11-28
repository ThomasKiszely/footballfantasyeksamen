const Team = require('../models/teamModel');


async function createTeam(teamData) {
    const teamModel = new teamModel(teamData);
    return await teamModel.save();
}

async function saveTeam(teamData) {
    return await Team.save();
}

async function getAllTeams() {
    return await Team.find({});
}

async function getTeamById(teamId) {
    return await Team.findById(teamId);
}

async function getTeamByName(teamName) {
   const teamModel = await teamModel.findOne({teamName});
    return teamModel;
}

async function updateTeam(teamId, projectData) {
    const updatedTeam = await Team.findOneAndUpdate(teamId, projectData, {new: true, runValidators: true});
    return updatedTeam;
}

async function deleteTeam (teamId) {
    const deleted = await Team.findOneAndDelete(teamId);
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