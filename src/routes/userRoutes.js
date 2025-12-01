const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

/*
router.get('/', userController.getAll);
router.get('/:id', userController.getById);

 */
router.post('/signup', userController.signup);
router.post('/login', userController.login);

router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);


module.exports = router;