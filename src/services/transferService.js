const teamService = require("../services/teamService")
const playerService = require("../services/playerService");
const {getAllMatches} = require("../data/footballMatchRepo");
const mongoose = require("mongoose");
const {isClubLimitExceeded, MAX_PLAYERS_PER_CLUB, MAX_PLAYERS_TOTAL} = require("../policies/teamPolicy");
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

    // 1. Hent Spiller og Hold
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



    // 2. Tjek Allerede Ejet
    // Tjekker om spillerens ID allerede er i arrayet.
    if (team.players.some(pId => pId.equals(playerMaster._id))) {
        throw new Error("Denne spiller er allerede på dit hold.");
    }

    // 3. Tjek Budget
    const purchasePrice = playerMaster.price;
    if (team.budget < purchasePrice) {
        throw new Error(`Ikke nok budget. Mangler: ${purchasePrice - team.budget} kr.`);
    }

    // 4. Tjek Maksimalt Antal Spillere
    if (team.players.length >= MAX_PLAYERS_TOTAL) {
        throw new Error(`Dit hold er allerede fuldt. Du skal sælge en spiller, før du kan købe en ny.`);
    }

    // 5. Tjek Klubgrænse
    const newClub = playerMaster.club.toLowerCase().trim();

    // Henter kun ID'er, der findes
    const ownedPlayerIds = team.players.filter(id => id);

    // Henter de ejede spillerobjekter for at tjekke klubber.
    let ownedPlayers = await playerService.findManyByIds(ownedPlayerIds);

    if (!Array.isArray(ownedPlayers)) {
        ownedPlayers = [];
    }

    const currentClubCount = ownedPlayers.filter(p =>
        (p.club ? p.club.toLowerCase().trim() : '') === newClub
    ).length;


    if (currentClubCount + 1 > MAX_PLAYERS_PER_CLUB) {

        throw new Error(`Du må kun have ${MAX_PLAYERS_PER_CLUB} spillere fra samme klub (${playerMaster.club}).`);
    }

    // 6. Gennemfør Transaktion
    team.budget -= purchasePrice;
    team.players.push(playerMaster._id);

    return await team.save();
}



module.exports = {
    sellPlayer,
    buyPlayer,
}