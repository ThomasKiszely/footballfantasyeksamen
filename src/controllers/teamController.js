const teamService = require('../services/teamService');
const teamPointsService = require('../services/teamPointsService');
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
        if (!team) return res.status(404).json({ error: "Team not found" });

        console.log("team.userId:", team.userId.toString(), "req.user.id:", req.user.id);

        if (team.userId.toString() !== req.user.id) {
            return res.status(403).json({ error: "Du har ikke adgang til dette team" });
        }

        const updatedTeam = await teamPointsService.updateTeamPoints(req.params.id);
        if (!updatedTeam) {
            return res.status(500).json({ error: "Kunne ikke opdatere point" });
        }

        console.log("Team: ", updatedTeam);
        return res.status(200).json(updatedTeam);
    } catch (err) {
        console.error("Fejl i getById:", err);
        res.status(500).json({ error: err.message });
    }
};




exports.create = async (req, res) => {
    try {
        const newTeam = await teamService.createTeam({
            ...req.body,
            userId: req.user.id   // stadig kun id fra auth
        });
        res.status(201).json(newTeam);
    } catch (err) {
        res.status(400).json({ error: err.message });
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
