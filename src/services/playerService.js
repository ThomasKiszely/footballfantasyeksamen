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