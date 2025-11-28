const teamService = require('../services/teamService');

exports.getAll = async (req, res) => {
    try {
        const teams = await teamService.getAllTeams();
        res.json(teams);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const team = await teamService.getTeamById(req.params.id);
        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }
        res.json(team);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const newTeam = await teamService.createTeam(req.body);
        res.status(201).json(newTeam);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const updatedTeam = await teamService.updateTeam(req.params.id, req.body);
        if (!updatedTeam) {
            return res.status(404).json({ error: 'Team not found' });
        }
        res.json(updatedTeam);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.deleteTeam = async (req, res) => {
    try {
        const deletedTeam = await teamService.deleteTeam(req.params.id);
        if (!deletedTeam) {
            return res.status(404).json({ error: 'Team not found' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};