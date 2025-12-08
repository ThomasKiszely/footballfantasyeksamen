const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authToken = require('../middlewares/authMiddleware');

router.use(authToken);

router.get('/users', adminController.getAllUsers);
router.patch('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

router.get('/players', adminController.getAllPlayers);
router.patch('/players/:id', adminController.updatePlayer);

router.get('/teams', adminController.getAllTeams);
router.patch('/teams/:id', adminController.updateTeam);

router.get('/matches', adminController.getAllMatches);
router.post('/sync-matches', adminController.syncMatches);
router.patch('/matches/:id', adminController.updateFootballMatch);

module.exports = router;