const teamService = require("../services/teamService")
const playerService = require("../services/playerService");
const {getAllMatches} = require("../data/footballMatchRepo");
const mongoose = require("mongoose");

const STARTED_MATCH_STATUSES = ['IN_PLAY', 'PAUSED', 'FINISHED', 'LIVE', 'HT', 'FT', 'AET', 'PEN_AET'];

async function isTransferWindowClosed(gameweekNumber) {
    const allMatches = await getAllMatches();

    const currentGameweekMatches = allMatches.filter(match =>
        parseInt(match.matchday) === gameweekNumber
    );

    if(currentGameweekMatches.length === 0) {
        return false;
    }

    const isAnyMatchStarted = currentGameweekMatches.some(match => {
        return STARTED_MATCH_STATUSES.includes(match.status);
    });

    if(isAnyMatchStarted) {
        console.log(`GW ${gameweekNumber} transfervindue lukket, da en kamp er startet.`);
        return true;
    }

    const earliestKickoff = currentGameweekMatches.reduce((earliestTime, match) => {
        const matchTime = new Date(match.date);
        return matchTime < earliestTime || earliestTime === null ? matchTime : earliestTime;
    }, null);

    if(earliestKickoff && new Date() >= earliestKickoff) {
        console.log(`GW ${gameweekNumber} transfervindue lukket, da kickoff-tidspunktet er overskredet.`);
        return true;
    }
    return false;
}


async function sellPlayer(playerId, teamId) {
    const player = await playerService.findById(playerId);
    if (!player) {
        throw new Error("Spiller ikke fundet.");
    }
    const team = await teamService.getTeamById(teamId);

    const isClosed = await isTransferWindowClosed(team.currentGameweek);

    if (isClosed) {
        throw new Error("Transfervinduet for denne Gameweek er lukket, da kampe er i gang eller færdige.");
    }

    const targetId = new mongoose.Types.ObjectId(playerId);
    const isPlayerOwned = team.players.some(ownerId => {
        return ownerId.equals(playerId);
    });

    if(!isPlayerOwned) {
        throw new Error("Dette hold ejer ikke denne spiller.");
    }


    const salesPrice = player.price;

    team.budget += salesPrice;

    team.players = team.players.filter(ownedId => !ownedId.equals(targetId));

    return await team.save();
}

async function buyPlayer(playerId, teamId) {
    const playerMaster = await playerService.findById(playerId);

    if (!playerMaster) {
        throw new Error("Spiller ikke fundet.");
    }

    const team = await teamService.getTeamById(teamId);
    if (!team) {
        throw new Error("Hold ikke fundet.");
    }

    const isClosed = await isTransferWindowClosed(team.currentGameweek);

    if (isClosed) {
        throw new Error("Transfervinduet for denne Gameweek er lukket, da kampe er i gang eller færdige.");
    }

    if (team.players.some(p => p._id.toString() === playerId)) {
        throw new Error("Denne spiller er allerede på dit hold.");
    }

    const purchasePrice = playerMaster.price;

    if (team.budget < purchasePrice) {
        throw new Error(`Ikke nok budget. Mangler: ${purchasePrice - team.budget}M.`);
    }

    team.budget -= purchasePrice;

    team.players.push(playerMaster._id);

    // 5. Gem og returner
    return await team.save();
}



module.exports = {
    sellPlayer,
    buyPlayer,
}