const userService = require("../services/userService");
const playerService = require("../services/playerService");


function isUserAdmin (userId) {
    const user = userService.getUserById(userId);
    if (user.role === "admin") {
        return true;
    }
}

function adminDeleteUser (userId) {
    const user = userService.getUserById(userId);
    if (isUserAdmin(user)) {
        userService.deleteUser(userId)
    }
}

function adminUpdateUser (userId, updateData) {
    const user = userService.getUserById(userId);

    if (isUserAdmin(user)) {
        userService.updateUser(userId, updateData)
    }
}

function adminUpdateTeam () {
    const user = user.getUserById(userId);
    if (isUserAdmin(user)) {
        teamService.update(teamId, updateData)
    }
}

function adminUpdatePlayer () {

    const user = user.getUserById(userId);
    if (isUserAdmin(user)) {
        playerService.update(playerId, updateData)
    }
}

function updatePlayerPrice(playerId, newPrice, userId) {
    const user = user.getUserById(userId);
    if (isUserAdmin(user)) {
        playerService.updatePlayerPrice(playerId, newPrice)
    }
}

function adminUpdateFootballMatch () {
    const user = user.getUserById(userId);
    if (isUserAdmin(user)) {
        footballMatchService.update(matchId, updateData)
    }
}

module.exports = {
    isUserAdmin,
    adminUpdateUser,
    adminUpdateTeam,
    adminUpdatePlayer,
    updatePlayerPrice,
    adminUpdateFootballMatch,
    adminDeleteUser
}