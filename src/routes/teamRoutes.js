const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const authToken = require('../middlewares/authMiddleware');


router.get('/config', authToken, teamController.getTeamConfig);
router.get('/', authToken,teamController.getAll);
router.get('/:id', authToken,  teamController.getById);
router.post('/', authToken, teamController.create);
router.put('/:id', authToken, teamController.update);
router.delete('/:id', authToken, teamController.deleteTeam);

module.exports = router;