/**
 * @vitest-environment node
 */
import { vi, expect, describe, beforeEach, it } from 'vitest';
const { connectToMongo } = require('../src/services/db');
const playerRepo = require('../src/data/playerRepo');

describe('playerRepo', () => {

    beforeEach(async () => {
        await connectToMongo();
    });

    it('Should create a player', async () => {
        const player = await playerRepo.create({
            name: 'john',
            club: 'Manchester United',
            position: 'Defender',
            price: 200
        });

        expect(player).toEqual(expect.objectContaining({
            name: 'john',
            club: 'Manchester United',
            position: 'Defender',
            price: 200
        }));
    });

    it('Read all players', async () => {
        const testPlayer1 = { name: 'johnny', club: 'Manchester City', position: 'Attacker', price: 250 };
        const testPlayer2 = { name: 'ron', club: 'Chelsea', position: 'Attacker', price: 150 };

        await playerRepo.create(testPlayer1);
        await playerRepo.create(testPlayer2);

        const allPlayers = await playerRepo.findAll();

        expect(allPlayers).toBeDefined();
        expect(allPlayers.length).toBeGreaterThanOrEqual(2);
        expect(allPlayers).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ name: 'johnny' }),
                expect.objectContaining({ name: 'ron' }),
            ])
        );
    });

    it('Delete a player', async () => {
        const testPlayer3 = { name: 'john', club: '123', position: 'Attacker', price: 200 };
        const createdPlayer = await playerRepo.create(testPlayer3);

        expect(createdPlayer._id).toBeDefined();

        const deleteResult = await playerRepo.delete(createdPlayer._id);

        expect(deleteResult._id).toEqual(createdPlayer._id);
    });

    it('Update a player', async () => {
        const testUpdatePlayer = { name: 'Ronaldo', club: 'Al Nassr', position: 'GK', price: 300 };
        const createdPlayer = await playerRepo.create(testUpdatePlayer);
        expect(createdPlayer._id).toBeDefined();

        const updatedPlayer = await playerRepo.update(createdPlayer._id, { name: 'Messi' });

        expect(updatedPlayer.name).toEqual('Messi');
    });
});
