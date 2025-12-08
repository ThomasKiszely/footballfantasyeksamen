const adminService = require("../services/adminService");

// --- USERS ---
exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await adminService.getAllUsers(req.user.id);
        res.status(200).json(users);
    } catch (error) { next(error); }
};

exports.deleteUser = async (req, res, next) => {
    try {
        await adminService.deleteUser(req.user.id, req.params.id);
        res.status(204).send();
    } catch (error) { next(error); }
};

exports.updateUser = async (req, res, next) => {
    try {
        const updatedUser = await adminService.updateUser(req.user.id, req.params.id, req.body);
        res.status(200).json(updatedUser);
    } catch (error) { next(error); }
};

exports.getAllPlayers = async (req, res, next) => {
    try {
        const players = await adminService.getAllPlayers(req.user.id);
        res.status(200).json(players);
    } catch (error) { next(error); }
};

exports.updatePlayer = async (req, res, next) => {
    try {
        const updatedPlayer = await adminService.updatePlayer(req.user.id, req.params.id, req.body);
        res.status(200).json(updatedPlayer);
    } catch (error) { next(error); }
};

exports.getAllTeams = async (req, res, next) => {
    try {
        const teams = await adminService.getAllTeams(req.user.id);
        res.status(200).json(teams);
    } catch (error) { next(error); }
};

exports.updateTeam = async (req, res, next) => {
    try {
        const updatedTeam = await adminService.updateTeam(req.user.id, req.params.id, req.body);
        res.status(200).json(updatedTeam);
    } catch (error) { next(error); }
};

// --- MATCHES ---
exports.getAllMatches = async (req, res, next) => {
    try {
        const matches = await adminService.getAllMatches(req.user.id);
        res.status(200).json(matches);
    } catch (error) { next(error); }
};

exports.syncMatches = async (req, res, next) => {
    try {
        await adminService.syncMatches(req.user.id);
        res.status(200).json({ message: "Sync fuldført" });
    } catch (error) { next(error); }
};

exports.updateFootballMatch = async (req, res, next) => {
    try {
        const updatedMatch = await adminService.updateFootballMatch(req.user.id, req.params.id, req.body);
        res.status(200).json(updatedMatch);
    } catch (error) { next(error); }
};