const teamService = require("../services/teamService")
const playerService = require("../services/playerService");
const {getAllMatches} = require("../data/footballMatchRepo");

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

    const deadline = await getGameweekDeadline(team.currentGameweek);

    if (deadline && new Date() >= deadline) {
        throw new Error("Transfervinduet for denne Gameweek er lukket. Vent venligst på, at alle kampe er færdige.");
    } else {
        team.budget += player.price;
        team.players.pull(player._id);
        return await team.save();
    }
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


module.exports = {
    sellPlayer,
}