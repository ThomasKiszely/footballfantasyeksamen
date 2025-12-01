const Player = require('../models/player');

// snakker med databasen og udfører CRUD operationer

// opretter en ny spiller
exports.create = async (playerData) => {
    const newPlayer = new Player(playerData);
    return await newPlayer.save();
};

// returnerer en specifik spiller baseret på ID
exports.findById = async (id) => {
    return await Player.findById(id);
};

// returnerer alle spillere
exports.findAll = async () => {
    return await Player.find();
};

exports.update = async (id, updateData) => {
    return await Player.findByIdAndUpdate(id, updateData, { new: true });
};

exports.delete = async (id) => {
    return await Player.findByIdAndDelete(id);
};

// opdaterer eller indsætter flere spillere baseret på navn og klub hvert 10. minut
exports.bulkUpsert = async (players) => {
    const bulkOps = players.map(player => ({
        updateOne: {
            filter: { name: player.name, club: player.club },
            update: { $set: { position: player.position} },
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
