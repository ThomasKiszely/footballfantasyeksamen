const Team = require('../models/Team');
const Player = require('../models/Player');
const User = require('../models/User');
require('dotenv').config();

// CRUD

const createTeam = async (teamData) => {
    try {
        const team = new Team({
            userId: teamData.userId,
            goalkeeper: teamData.goalkeeper || null,
            defenders: teamData.defenders || [],
            midfielders: teamData.midfielders || [],
            attackers: teamData.attackers || []
        });

        return await team.save();
    } catch (error) {
        throw new Error(`Error creating team: ${error.message}`);
    }
};

const findById = async (teamId) => {
    try {
        const team = await Team.findById(teamId)
            .populate('goalkeeper')
            .populate('defenders')
            .populate('midfielders')
            .populate('attackers')
            .populate('userId');
        if (!team) {
            throw new Error('Team not found');
        }
        return team;
    } catch (error) {
        throw new Error(`Error finding team: ${error.message}`);
    }
};

const findByUserId = async (userId) => {
    try {
        const team = await Team.findOne({ userId })
            .populate('goalkeeper')
            .populate('defenders')
            .populate('midfielders')
            .populate('attackers');
        return team;
    } catch (error) {
        throw new Error(`Error finding team by user: ${error.message}`);
    }
};
const findAll = async () => {
    try {
        const teams = await Team.find()
            .populate('goalkeeper')
            .populate('defenders')
            .populate('midfielders')
            .populate('attackers')
            .populate('userId');

        if (teams.length <= 0) {
            throw new Error('No teams found');
        }
        return teams;
    } catch (error) {
        throw new Error(`Error retrieving teams: ${error.message}`);
    }
};

const updateTeam = async (teamId, updateData) => {
    try {
        const updatedTeam = await Team.findByIdAndUpdate(
            teamId,
            updateData,
            { new: true, runValidators: true }
        )
            .populate('goalkeeper')
            .populate('defenders')
            .populate('midfielders')
            .populate('attackers');
        if (!updatedTeam) {
            throw new Error('Team not found');
        }
        return updatedTeam;
    } catch (error) {
        throw new Error(`Error updating team: ${error.message}`);
    }
};
const deleteTeam = async (teamId) => {
    try {
        const deletedTeam = await Team.findByIdAndDelete(teamId);
        if (!deletedTeam) {
            throw new Error('Team not found');
        }
        return deletedTeam;
    } catch (error) {
        throw new Error(`Error deleting team: ${error.message}`);
    }
};
module.exports = {
    createTeam,
    findById,
    findByUserId,
    findAll,
    updateTeam,
    deleteTeam,
};