const playerRepo = require('../data/playerRepo');
const playerService = require('../services/playerService');

// CRUD
// CREATE (POST)
exports.createPlayer = async (req, res) => {
    try {
        const { name, club, position, price } = req.body;
        const savedPlayer = await playerService.create({ name, club, position, price });
        res.status(201).json(savedPlayer);
    } catch (error) {
        res.status(500).json({ message: 'Error creating player', error });
    }
};

// READ (GET)
exports.getPlayer = async (req, res) => {
    try {
        const player = await playerService.findById(req.params.id);
        if (!player) {
            return res.status(404).json({ message: 'Player not found' });
        }
        res.status(200).json(player);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving player', error });
    }
};

// READ ALL (GET)
exports.getAllPlayers = async (req, res) => {
    try {
        const players = await playerService.findAll();
        res.status(200).json(players);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving players', error });
    }
};

// UPDATE (PUT)
exports.updatePlayer = async (req, res) => {
    try {
        const updatedPlayer = await playerService.update(req.params.id, req.body);
        if (!updatedPlayer) {
            return res.status(404).json({ message: 'Player not found' });
        }
        res.status(200).json(updatedPlayer);
    } catch (error) {
        res.status(500).json({ message: 'Error updating player', error });
    }
};

// DELETE (DELETE)
exports.deletePlayer = async (req, res) => {
    try {
        const deletedPlayer = await playerService.delete(req.params.id);
        if (!deletedPlayer) {
            return res.status(404).json({ message: 'Player not found' });
        }
        res.status(200).json({ message: 'Player deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting player', error });
    }
};