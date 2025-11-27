const playerRepo = require('../data/playerRepo');

exports.createPlayer = async (req, res) => {
    try {
        const { name, club, position, price } = req.body;
        const savedPlayer = await playerRepo.create({ name, club, position, price });
        res.status(201).json(savedPlayer);
    } catch (error) {
        res.status(500).json({ message: 'Error creating player', error });
    }
};

exports.getPlayer = async (req, res) => {
    try {
        const player = await playerRepo.findById(req.params.id);
        if (!player) {
            return res.status(404).json({ message: 'Player not found' });
        }
        res.status(200).json(player);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving player', error });
    }
};

exports.getAllPlayers = async (req, res) => {
    try {
        const players = await playerRepo.findAll();
        res.status(200).json(players);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving players', error });
    }
};

exports.updatePlayer = async (req, res) => {
    try {
        const updatedPlayer = await playerRepo.update(req.params.id, req.body);
        if (!updatedPlayer) {
            return res.status(404).json({ message: 'Player not found' });
        }
        res.status(200).json(updatedPlayer);
    } catch (error) {
        res.status(500).json({ message: 'Error updating player', error });
    }
};

exports.deletePlayer = async (req, res) => {
    try {
        const deletedPlayer = await playerRepo.delete(req.params.id);
        if (!deletedPlayer) {
            return res.status(404).json({ message: 'Player not found' });
        }
        res.status(200).json({ message: 'Player deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting player', error });
    }
};