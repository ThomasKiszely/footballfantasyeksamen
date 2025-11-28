const userService = require('../services/userService');


async function signup(req, res, next) {
    try {
        const { username, password } = req.body;
        const newUser = await userService.signUp(username, password);
        return res.status(201).json({
            success: true,
            user: { id: newUser._id, username: newUser.username }
        });
    } catch (error) {
        next(error);
    }
}

async function login(req, res, next) {
    try{
        const { username, password } = req.body;
        const {token, user } = await userService.login(username, password);
        console.log(user);
        return res.status(200).json({
            success: true,
            token,
            user,
        });
    } catch (error) {
        next(error);
    }
}

async function getUserById(req, res, next) {
    try {
        const userId = req.params.id;
        const user = await userService.getUserById(userId);
        return res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        next(error);
    }
}

async function getUserBudget(req, res, next) {
    try {
        const userId = req.params.id;
        const user = await userService.getUserById(userId);
        return res.status(200).json({
            success: true,
            budget: user.budget,
        });
    } catch (error) {
        next(error);
    }
}

async function updateUser(req, res, next) {
    try{
        const id = req.params.id;
        const user = req.body;
        const updatedUser = await userService.updateUser(id, user);
        return res.status(200).json({ success: true, updatedUser });
    } catch (error) {
        next(error);
    }
}

async function deleteUser(req, res, next) {
    try{
        const userId = req.params.id;
        const user = await userService.deleteUser(userId);
        return res.status(204).send();
    } catch (error) {
        next(error);
    }
}

module.exports = {
    signup,
    login,
    getUserById,
    getUserBudget,
    updateUser,
    deleteUser,
};