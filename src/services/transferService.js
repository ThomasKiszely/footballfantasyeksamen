/* Herunder har vi lavet vores bedste bud på Clean Architecture og Single Responsibility.
*  Udarbejdet under vores refraktorerings periode i projektet. */

const teamService = require("../services/teamService");
const playerService = require("../services/playerService");
const { getAllMatches } = require("../data/footballMatchRepo");
const mongoose = require("mongoose");
const { MAX_PLAYERS_PER_CLUB, MAX_PLAYERS_TOTAL } = require("../policies/teamPolicy");

const STARTED_MATCH_STATUSES = ['IN_PLAY', 'PAUSED', 'FINISHED', 'LIVE', 'HT', 'FT', 'AET', 'PEN_AET'];


// Her sælger vi spiller
async function sellPlayer(playerId, teamId) {
    const player = await playerService.findById(playerId);
    if (!player) {
        throw new Error("Spiller ikke fundet.");
    }

    const team = await teamService.getTeamById(teamId);

    await validateTransferWindowClosed(team.currentGameweek);
    validatePlayerOwned(team, player);

    return executeSale(team, player);
}

// Køber spiller
async function buyPlayer(playerId, teamId) {
    const player = await playerService.findById(playerId);
    const team = await teamService.getTeamById(teamId);

    await validateTransferWindowClosed(team.currentGameweek);
    validatePlayerNotOwned(team, player);
    validateBudget(team, player);
    validateSquadSize(team);
    await validateClubLimit(team, player);

    return executePurchase(team, player);
}

async function validateTransferWindowClosed(gameweek) {
    const isClosed = await isTransferWindowClosed(gameweek);
    if (isClosed) {
        throw new Error("Transfervinduet er lukket for denne gameweek, da kampe er i gang eller færdige.");
    }
}

function validatePlayerOwned(team, player) {
    const isOwned = team.players.some(id => id.equals(player._id));
    if (!isOwned) {
        throw new Error("Dette hold ejer ikke denne spiller.");
    }
}

function validatePlayerNotOwned(team, player) {
    const alreadyOwned = team.players.some(id => id.equals(player._id));
    if (alreadyOwned) {
        throw new Error("Denne spiller er allerede på dit hold");
    }
}

function validateBudget(team, player) {
    if (team.budget < player.price) {
        throw new Error("Ikke nok budget");
    }
}

function validateSquadSize(team) {
    if (team.players.length >= MAX_PLAYERS_TOTAL) {
        throw new Error(`Dit hold er allerede fuldt. Du skal sælge en spiller, før du kan købe en ny.`);
    }
}

async function validateClubLimit(team, player) {
    const clubCount = await countPlayersFromClub(team, player.club);
    if (clubCount >= MAX_PLAYERS_PER_CLUB) {
        throw new Error(`Du må kun have ${MAX_PLAYERS_PER_CLUB} spillere fra samme klub (${player.club}).`);
    }
}

async function countPlayersFromClub(team, club) {
    const normalizedClub = club.toLowerCase().trim();
    const ownedPlayerIds = await playerService.findManyByIds(team.players);
    return ownedPlayerIds.filter(p => p.club?.toLowerCase().trim() === normalizedClub).length;
}

function executeSale(team, player) {
    team.budget += player.price;
    team.players.pull(player._id);
    return team.save();
}

function executePurchase(team, player) {
    team.budget -= player.price;
    team.players.push(player._id);
    return team.save();
}

async function isTransferWindowClosed(gameweekNumber) {
    const allMatches = await getAllMatches();
    const currentGameweekMatches = filterMatchesByGameweek(allMatches, gameweekNumber);

    if (currentGameweekMatches.length === 0) {
        return false;
    }

    if (hasAnyMatchStarted(currentGameweekMatches)) {
        return true;
    }

    if (hasKickoffPassed(currentGameweekMatches)) {
        return true;
    }

    return false;
}

function filterMatchesByGameweek(matches, gameweekNumber) {
    return matches.filter(match => parseInt(match.matchday) === gameweekNumber);
}

function hasAnyMatchStarted(matches) {
    return matches.some(match => STARTED_MATCH_STATUSES.includes(match.status));
}

function hasKickoffPassed(matches) {
    const earliestKickoff = matches.reduce((earliest, match) => {
        const matchTime = new Date(match.date);
        return (!earliest || matchTime < earliest) ? matchTime : earliest;
    }, null);

    return earliestKickoff && new Date() >= earliestKickoff;
}

module.exports = {
    sellPlayer,
    buyPlayer,
};