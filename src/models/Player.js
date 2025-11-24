const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    club: { type: String, required: true },
    position: { type: String, required: true },
    price: { type: Number, required: true },
});

const Player = mongoose.model('Player', playerSchema);

module.exports = Player;