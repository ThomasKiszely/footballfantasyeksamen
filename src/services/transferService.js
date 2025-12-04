const teamService = require("../services/teamService")
const playerService = require("../services/playerService");

async function sellPlayer(playerId, teamId) {
    const player = await playerService.findById(playerId);
    if (!player) {
        throw new Error("Spiller ikke fundet.");
    }
    const team = await teamService.getTeamById(teamId);
    if (!team) {
        throw new Error("Hold ikke fundet.");
    }
    if (!team.players.includes(player._id)) {
        throw new Error("Dette hold ejer ikke denne spiller.");
    }
    team.budget += player.price;
    team.players.pull(player._id);
    return await team.save();
}


module.exports = {
    sellPlayer
}