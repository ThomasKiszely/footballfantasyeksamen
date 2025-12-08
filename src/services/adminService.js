const userService = require("../services/userService");
const playerService = require("../services/playerService");
const teamService = require("../services/teamService");
const footballMatchService = require("../services/footballMatchService");

async function verifyAdmin(adminId) {
    const user = await userService.getUserById(adminId);
    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    if (user.role !== "admin") {
        const error = new Error("Adgang nægtet: ikke admin");
        error.statusCode = 403;
        throw error;
    }
    return true;
}

exports.getAllUsers = async (adminId) => {
    await verifyAdmin(adminId);
    return await userService.getAllUsers();
};

exports.deleteUser = async (adminId, targetUserId) => {
    await verifyAdmin(adminId);
    return await userService.deleteUser(targetUserId);
};

exports.updateUser = async (adminId, targetUserId, updateData) => {
    await verifyAdmin(adminId);
    return await userService.updateUser(targetUserId, updateData);
};

exports.updatePlayer = async (adminId, playerId, updateData) => {
    await verifyAdmin(adminId);
    return await playerService.update(playerId, updateData);
};

exports.getAllTeams = async (adminId) => {
    await verifyAdmin(adminId);
    return await teamService.getAllTeams();
};

exports.updateTeam = async (adminId, teamId, updateData) => {
    await verifyAdmin(adminId);
    return await teamService.updateTeam(teamId, updateData);
};

exports.updateFootballMatch = async (adminId, matchId, updateData) => {
    await verifyAdmin(adminId);
    return await footballMatchService.updateFootballMatch(matchId, updateData);
};

exports.getAllMatches = async (adminId) => {
    await verifyAdmin(adminId);
    return await footballMatchService.getAllMatches();
};

exports.syncMatches = async (adminId) => {
    await verifyAdmin(adminId);
    return await footballMatchService.fetchAllMatches();
};

exports.getAllPlayers = async (adminId) => {
    await verifyAdmin(adminId);
    return await playerService.findAll();
};