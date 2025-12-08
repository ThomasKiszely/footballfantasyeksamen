const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authToken = require('../middlewares/authMiddleware');

router.get('/check', authToken, userController.checkAuth);
router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.post('/logout', userController.logout);

router.put('/:id', authToken, userController.updateUser);
router.delete('/:id', authToken,userController.deleteUser);


module.exports = router;