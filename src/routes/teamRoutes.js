const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const authToken = require('../middlewares/authMiddleware');

router.get('/', teamController.getAll);
router.get('/:id', authToken,  teamController.getById);
router.post('/', authToken , teamController.create);
router.put('/:id', teamController.update);
router.delete('/:id', teamController.deleteTeam);

module.exports = router;