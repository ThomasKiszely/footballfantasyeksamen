const express = require('express');
const router = express.Router();
const transferController = require('../controllers/transferController');
const authToken = require('../middlewares/authMiddleware');


router.delete('/sell/:playerId', authToken, transferController.sellPlayer);

router.post('/buy', authToken, transferController.buyPlayer);

module.exports = router;