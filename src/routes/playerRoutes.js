const express = require('express');
const router = express.Router();
const playerRepo = require('../data/playerRepo');

router.get('/', async (req, res) => {
    try {
        const players = await playerRepo.findAll();
        res.json(players);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const player = await playerRepo.findById(req.params.id);
        if (!player) {
            return res.status(404).json({ error: 'Player not found' });
        }
        res.json(player);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const newPlayer = await playerRepo.create(req.body);
        res.status(201).json(newPlayer);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const updatedPlayer = await playerRepo.update(req.params.id, req.body);
        if (!updatedPlayer) {
            return res.status(404).json({ error: 'Player not found' });
        }
        res.json(updatedPlayer);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const deletedPlayer = await playerRepo.delete(req.params.id);
        if (!deletedPlayer) {
            return res.status(404).json({ error: 'Player not found' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
