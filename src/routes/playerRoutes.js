const express = require('express');
const router = express.Router();
const playerRepo = require('../data/playerRepo');

router.get('/', playerRepo.readAllPlayers);
router.get('/:id', playerRepo.readPlayer);
router.post('/', playerRepo.createPlayer);
router.put('/:id', playerRepo.updatePlayer);
router.delete('/:id', playerRepo.deletePlayer);
