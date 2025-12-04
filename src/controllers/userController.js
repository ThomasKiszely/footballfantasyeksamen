const userService = require('../services/userService');
const teamService = require('../services/teamService');

async function signup(req, res, next) {
    try {
        const { username, password } = req.body;
        const { token, user } = await userService.signUp(username, password);
        res.cookie("jwt", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 1000 * 60 * 60, //1 time
        });

        console.log("[login] user._id typeof:", typeof user._id, "value:", user._id);
        const team = await teamService.getTeamByUserId(user._id || user.id);
        console.log("[login] team found:", team && team._id);


        return res.status(201).json({
            success: true,
            user,
            teamId: team ? team._id : null,
        });
    } catch (error) {
        next(error);
    }
}

async function login(req, res, next) {
    try{
        const { username, password } = req.body;
        const {token, user } = await userService.login(username, password);
        res.cookie("jwt", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 1000 * 60 * 60,
        });

        console.log("[login] user._id typeof:", typeof user._id, "value:", user._id);
        const team = await teamService.getTeamByUserId(user._id || user.id);
        console.log("[login] team found:", team && team._id);


        return res.status(200).json({
            success: true,
            user: {
                _id: user._id,
                username: user.username,
                teams: user.teams,
                role: user.role,
            },
            teamId: team ? team._id : null,
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
        console.log(id);
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
async function logout(req, res, next) {
    try{
        res.clearCookie("jwt", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });
        return res.status(200).json({ success: true, message: "Logout successfully." });
    } catch (error){
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
    logout,
};