const Player = require("../models/Player");
const playerRepo = require("../data/playerRepo");

exports.create = async (playerData) => {
    await playerRepo.create(playerData)
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

exports.convertPosition = (position) => {
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
