import { vi, describe, it, expect, afterEach } from 'vitest';

const userService = require('../src/services/userService');
const userRepo = require('../src/data/userRepo');
const playerRepo = require('../src/data/playerRepo');

const getUserByIdMock = vi.spyOn(userRepo, 'getUserById');
const getPlayerByIdMock = vi.spyOn(playerRepo, 'getPlayerById');

describe('userService.canAffordPlayer', () => {

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('Should return true when user has enough budget to purchase the player', async () => {
        const userId = 'user-1';
        const playerId = 'player-1';

        getUserByIdMock.mockResolvedValue({ budget: 100 });
        getPlayerByIdMock.mockResolvedValue({ price: 50 });

        const canAfford = await userService.canAffordPlayer(userId, playerId);

        expect(canAfford).toBe(true);
        expect(getUserByIdMock).toHaveBeenCalledWith(userId);
        expect(getPlayerByIdMock).toHaveBeenCalledWith(playerId);
    });

    it('Should throw an error when user has insufficient budget', async () => {
        const userId = 'user-2';
        const playerId = 'player-2';

        getUserByIdMock.mockResolvedValue({ budget: 50 });
        getPlayerByIdMock.mockResolvedValue({ price: 100 });

        await expect(userService.canAffordPlayer(userId, playerId)).rejects.toThrow(
            'Insufficient budget to purchase player.'
        );

        expect(getUserByIdMock).toHaveBeenCalledWith(userId);
        expect(getPlayerByIdMock).toHaveBeenCalledWith(playerId);
    });

    it('Should return true when user budget exactly matches player price', async () => {
        const userId = 'user-3';
        const playerId = 'player-3';

        getUserByIdMock.mockResolvedValue({ budget: 75 });
        getPlayerByIdMock.mockResolvedValue({ price: 75 });

        const canAfford = await userService.canAffordPlayer(userId, playerId);

        expect(canAfford).toBe(true);
    });
});