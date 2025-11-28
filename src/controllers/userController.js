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
        const user = await userService.login(username, password);
        return res.status(200).json({
            success: true,
            user: { id: user._id, username: user.username },
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    signup,
    login,
};