const Player = require('../models/player');
require('dotenv').config();

// CRUD
exports.createPlayer = async (req, res) => {
    try {
        const { name, club, position, price } = req.body;
        const newPlayer = new Player({ name, club, position, price });
        const savedPlayer = await newPlayer.save();
        res.status(201).json(savedPlayer);
    } catch (error) {
        res.status(500).json({ message: 'Error creating player', error });
    }
}

exports.readAllPlayers = async (req, res) => {
    try {
        const players = await Player.find();
        if (players.length <= 0) {
            return res.status(404).json({ message: 'No players found' });
        }
        res.status(200).json(players);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving players', error });
    }
}

exports.updatePlayer = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;
        const updatedPlayer = await Player.findByIdAndUpdate(id, updatedData, { new: true });
        if (!updatedPlayer) {
            return res.status(404).json({ message: 'Player not found' });
        }
        res.status(200).json(updatedPlayer);
    } catch (error) {
        res.status(500).json({ message: 'Error updating player', error });
    }
}

exports.deletePlayer = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedPlayer = await Player.findByIdAndDelete(id);
        if (!deletedPlayer) {
            return res.status(404).json({ message: 'Player not found' });
        }
        res.status(200).json(deletedPlayer);
    } catch (error) {
        res.status(500).json({ message: 'Error deleting player', error });
    }
}


// tilføjer spillere til databasen fra API'et
exports.addPlayersToDb = async (players) => {
    try {
        const bulkOps = players.map(player => ({
            updateOne: {
                filter: { name: `${player.name}`, club: player.club },
                update: { $set: { position: player.position, price: player.price } },
                upsert: true
            }
        }));
        const result = await Player.bulkWrite(bulkOps);
        console.log(`${result.upsertedCount} new players added, ${result.modifiedCount} updated`);
    } catch (error) {
        console.error('Error adding players to database:', error);
    }
}

// API
exports.callPlayersApi = async (req, res) => {
    try {
        const response = await fetch('http://api.football-data.org/v4/teams', {
            headers: {
                'X-Auth-Token': process.env.API_KEY
            }
        });

        if (!response.ok) {
            return res.status(500).json({ message: 'API request failed: ${response.status}' });
        }

        const data = await response.json();

        // henter kun det relevante data for hver spiller
        const players = data.squad.map(player => ({
            name: `${player.firstName} ${player.lastName}`,
            club: data.name,
            position: player.position,
            price: player.marketValue
        }));

        // tilføjer spillerne til vores egen database
        await this.addPlayersToDb(players);

        res.status(200).json(players);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving player data from API', error: error.message });
    }
}

