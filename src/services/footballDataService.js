const playerRepo = require('../data/playerRepo');
require('dotenv').config();

exports.fetchAndSyncPlayers = async () => {
    const response = await fetch('http://api.football-data.org/v4/competitions/2021/teams', {
        headers: { 'X-Auth-Token': process.env.API_KEY }
    });

    if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    const players = [];

    data.teams.forEach(team => {
        team.squad.forEach(player => {
            players.push({
                name: player.name,
                club: team.name,
                position: player.position,
                price: 0
            });
        });
    });

    const result = await playerRepo.bulkUpsert(players);
    console.log(`${result.upsertedCount} new players added, ${result.modifiedCount} updated`);

    return { playerCount: players.length, teamCount: data.teams.length };
};
