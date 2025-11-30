const Team = require('../models/teamModel');
const mongoose = require("mongoose");

async function createTeam(teamData) {
    const team = new Team(teamData);
    return await team.save();
}



async function getAllTeams() {
    return await Team.find().populate("players");
}

async function getTeamById(teamId) {
    return await Team.findById(teamId).populate("players");
}

async function getTeamByName(teamName) {
   const teamModel = await Team.findOne({teamName});
    return teamModel;
}

async function updateTeam(teamId, projectData) {
    const updatedTeam = await Team.findOneAndUpdate({_id: teamId}, projectData, {new: true, runValidators: true});
    return updatedTeam;
}

async function deleteTeam (teamId) {
    const deleted = await Team.findOneAndDelete({_id: teamId});
    return deleted;
}

async function getTeamByUserId(userId) {
    const objectId = mongoose.Types.ObjectId.isValid(userId)
        ? new mongoose.Types.ObjectId(userId)
        : userId;
    return await Team.findOne({ userId: objectId });
}

module.exports = {
    createTeam,
    getAllTeams,
    getTeamById,
    getTeamByName,
    updateTeam,
    deleteTeam,
    getTeamByUserId,
};