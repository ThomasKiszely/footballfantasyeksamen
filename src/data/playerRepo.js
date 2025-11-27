const Player = require('../models/player');

// talks to the database and performs CRUD operations

exports.create = async (playerData) => {
    const newPlayer = new Player(playerData);
    return await newPlayer.save();
};

// returns one specific player from their id
exports.findById = async (id) => {
    return await Player.findById(id);
};

// returns all players
exports.findAll = async () => {
    return await Player.find();
};

exports.update = async (id, updateData) => {
    return await Player.findByIdAndUpdate(id, updateData, { new: true });
};

exports.delete = async (id) => {
    return await Player.findByIdAndDelete(id);
};

// Updates or creates new players (used ever 10 mins)
exports.bulkUpsert = async (players) => {
    const bulkOps = players.map(player => ({
        updateOne: {
            filter: { name: player.name, club: player.club },
            update: { $set: { position: player.position, price: player.price } },
            upsert: true
        }
    }));
    return await Player.bulkWrite(bulkOps);
};

exports.findByClub = async (club) => {
    return await Player.find({ club });
};

exports.findByPosition = async (position) => {
    return await Player.find({ position });
};

exports.findByPriceRange = async (minPrice, maxPrice) => {
    return await Player.find({ price: { $gte: minPrice, $lte: maxPrice } });
};
