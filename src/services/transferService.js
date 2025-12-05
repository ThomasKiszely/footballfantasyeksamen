const teamService = require("../services/teamService")
const playerService = require("../services/playerService");
const {getAllMatches} = require("../data/footballMatchRepo");
const mongoose = require("mongoose");

async function sellPlayer(playerId, teamId) {
    const player = await playerService.findById(playerId);
    if (!player) {
        throw new Error("Spiller ikke fundet.");
    }
    const team = await teamService.getTeamById(teamId);

    const targetId = new mongoose.Types.ObjectId(playerId);
    const isPlayerOwned = team.players.some(ownerId => {
        return ownerId.equals(playerId);
    });

    if(!isPlayerOwned) {
        throw new Error("Dette hold ejer ikke denne spiller.");
    }

    const deadline = await getGameweekDeadline(team.currentGameweek);

    if (deadline && new Date() >= deadline) {
        throw new Error("Transfervinduet for denne Gameweek er lukket. Vent venligst på, at alle kampe er færdige.");
    }

    const salesPrice = player.price;

    team.budget += salesPrice;

    team.players = team.players.filter(ownedId => !ownedId.equals(targetId));

    return await team.save();
}

async function getGameweekDeadline(gameweekNumber) { // eksporteres ikke fordi vi kun bruger den her
    const allMatches = await getAllMatches(); // Henter alle kampe

    // Filtrer kampe for den specifikke Gameweek
    const nextGameweekMatches = allMatches.filter(match =>
        parseInt(match.matchday) === gameweekNumber
    );

    if (nextGameweekMatches.length === 0) {
        return null;
    }

    // Find det tidligste kick-off tidspunkt i denne Gameweek
    return nextGameweekMatches.reduce((earliestTime, match) => {
        const matchTime = new Date(match.date); // Antager 'date' er en Date-objekt eller ISO-streng
        if (matchTime < earliestTime || earliestTime === null) {
            return matchTime;
        }
        return earliestTime;
    }, null); // Returnerer et Date-objekt
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

    const deadline = await getGameweekDeadline(team.currentGameweek);

    if (deadline && new Date() >= deadline) {
        throw new Error("Transfervinduet for denne Gameweek er lukket.");
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