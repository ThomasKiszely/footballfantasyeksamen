import { vi, describe, it, expect, afterEach } from 'vitest';

const userService = require('../src/services/userService');

const userRepo = require('../src/data/userRepo');
const playerRepo = require('../src/data/playerRepo');

const getUserByIdMock = vi.spyOn(userRepo, 'getUserById');
const getPlayerByIdMock = vi.spyOn(playerRepo, 'findById');

describe('userService.canAffordPlayer', () => {

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('Should return true when user has enough budget', async () => {
        const userId = 'joachim-rig';
        const playerId = 'joachim';

        getUserByIdMock.mockResolvedValue({ _id: userId, budget: 100 });
        getPlayerByIdMock.mockResolvedValue({ _id: playerId, price: 50 });

        const result = await userService.canAffordPlayer(userId, playerId);

        expect(result).toBe(true);
        expect(getUserByIdMock).toHaveBeenCalledWith(userId);
        expect(getPlayerByIdMock).toHaveBeenCalledWith(playerId);
    });

    it('Should throw error when user has insufficient budget', async () => {
        const userId = 'joachim-fattig';
        const playerId = 'joachim-hej';

        getUserByIdMock.mockResolvedValue({ _id: userId, budget: 50 });
        getPlayerByIdMock.mockResolvedValue({ _id: playerId, price: 100 });

        await expect(userService.canAffordPlayer(userId, playerId)).rejects.toThrow(
            'Insufficient budget to purchase player.'
        );
    });

    it('Should return true when budget exactly matches price', async () => {
        const userId = 'det-er-joachim';
        const playerId = 'hej-joachim';

        getUserByIdMock.mockResolvedValue({ _id: userId, budget: 75 });
        getPlayerByIdMock.mockResolvedValue({ _id: playerId, price: 75 });

        const result = await userService.canAffordPlayer(userId, playerId);

        expect(result).toBe(true);
    });
});