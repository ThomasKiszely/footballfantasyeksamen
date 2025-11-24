import {vi, expect, describe} from 'vitest';
const {connectToMongo} = require('../src/app');
const playerRepo = require('../src/data/playerRepo');

describe('playerRepo', () => {

    beforeEach(connectToMongo);
    it('Should create a player', async () => {
        let player;
        player = await playerRepo.createPlayer({name: 'john', club: 'Manchester United', position: 'Defender', price: 200});

        expect(player).toEqual(expect.objectContaining({
            name: 'john',
            club: 'Manchester City',
            price: 200
        }));
    });


    it('Read all players', async () => {
        const testPlayer1 = {
            name: 'johnny',
            club: 'Manchester City',
            position: 'Attacker',
            price: 250
        };
        const testPlayer2 = {
            name: 'ron',
            club: 'Chelsea',
            position: 'Attacker',
            price: 150
        };

        await playerRepo.createPlayer(testPlayer1);
        await playerRepo.createPlayer(testPlayer2);

        const allPlayers = await playerRepo.getAllPlayers();

        expect (allPlayers).toBeDefined();
        expect(allPlayers.length).toBeGreaterThanOrEqual(2);
        expect(allPlayers).toEqual([
            expect.objectContaining({username: 'johnny'}),
            expect.objectContaining({username: 'ron'}),
        ])
    });

    it('Delete a player', async () => {
        let testPlayer3 = {
            name: 'john',
            club: '123',
            position: 'Attacker',
            price: 200
        }
        const createdPlayer = await playerRepo.createPlayer(testPlayer3);

        expect(createdPlayer._id).toBeDefined();

        const deleteResult = await playerRepo.deletePlayer(createdPlayer._id);

        expect(deleteResult._id).toEqual(createdPlayer._id);

    });
    it('Update a player', async () => {
        let testUpdatePlayer = {
            name: 'Ronaldo',
            club: 'Al Nassr',
            price: 300
        }
        const createdPlayer = await playerRepo.createPlayer(testUpdatePlayer);
        expect(createdPlayer._id).toBeDefined();

        const updatedData = 'Messi';

        const updatedPlayer = await playerRepo.updatePlayer(createdPlayer._id, updatedData);

        expect(updatedPlayer.username).toEqual('john123');
    });
    it('Tests the addPlayersToDb function with upsert behavior', async () => {
        const players = [
            { name: 'Player1', club: 'ClubA', position: 'Midfielder', price: 100 },
            { name: 'Player2', club: 'ClubB', position: 'Defender', price: 150 },
        ];

        // First call to add players to DB
        await playerRepo.addPlayersToDb(players);

        // Modify one player and add a new player
        const updatedPlayers = [
            { name: 'Player1', club: 'ClubA', position: 'Forward', price: 120 }, // Updated
            { name: 'Player3', club: 'ClubC', position: 'Goalkeeper', price: 200 }, // New
        ];

        // Second call to add players to DB
        await playerRepo.addPlayersToDb(updatedPlayers);

        // Fetch all players to verify
        const allPlayers = await playerRepo.readAllPlayers();

        const player1 = allPlayers.find(p => p.name === 'Player1' && p.club === 'ClubA');
        const player2 = allPlayers.find(p => p.name === 'Player2' && p.club === 'ClubB');
        const player3 = allPlayers.find(p => p.name === 'Player3' && p.club === 'ClubC');

        expect(player1).toBeDefined();
        expect(player1.position).toBe('Forward');
        expect(player1.price).toBe(120);

        expect(player2).toBeDefined();

        expect(player3).toBeDefined();
        expect(player3.position).toBe('Goalkeeper');
        expect(player3.price).toBe(200);
    });

});

