const playerRepo = require("../data/playerRepo");
//const fetch = require('node-fetch');
const axios = require("axios");


exports.create = async (playerData) => {
    return await playerRepo.create(playerData)
};

exports.findById = async (id) => {
    return await playerRepo.findById(id);
};

exports.findAll = async () => {
    return await playerRepo.findAll();
};

exports.update = async (id, updateData) => {
    return await playerRepo.update(id, updateData);
};

exports.updatePlayerPrice = async (playerId, newPrice) => {
        return await playerRepo.update(playerId, {price: newPrice});
};

exports.delete = async (id) => {
    return await playerRepo.delete(id);
};

exports.bulkUpsert = async (players) => {
    return await playerRepo.bulkUpsert(players);
};

exports.findByClub = async (club) => {
    return await playerRepo.findByClub(club);
};

exports.findByPosition = async (position) => {
    return await playerRepo.findByPosition(position);
};

exports.findByPriceRange = async (minPrice, maxPrice) => {
    return await playerRepo.findByPriceRange(minPrice, maxPrice);
};

const convertPosition = (position) => {
    const positionMap = {
        "Left-Back": "LB",
        "Right-Back": "RB",
        "Centre-Back": "CB",
        "Centre-Forward": "CF",
        "Central Midfield": "CM",
        "Defensive Midfield": "CDM",
        "Attacking Midfield": "CAM",
        "Left Winger": "LW",
        "Right Winger": "RW",
        "Goalkeeper": "GK"
    };

    return positionMap[position] || position;
}


exports.fetchAndSyncPlayers = async () => {
    const response = await axios.get('http://api.football-data.org/v4/competitions/2021/teams', {
        headers: { 'X-Auth-Token': process.env.API_FOOTBALL_KEY }
    });

    const data = response.data
    const players = [];

    data.teams.forEach(team => {
        team.squad.forEach(player => {
            players.push({
                name: player.name,
                club: team.name,
                position: convertPosition(player.position),
            });
        });
    });

    const result = await playerRepo.bulkUpsert(players);
    console.log(`${result.upsertedCount} new players added, ${result.modifiedCount} updated`);

    return { playerCount: players.length, teamCount: data.teams.length };
};

