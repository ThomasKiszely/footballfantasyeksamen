import { vi, assert, test, describe, expect, it } from 'vitest';

const userService = require('../src/services/userService');
const userRepo = require('../src/data/userRepo');
const User = require('../src/models/User');
const bcrypt = require('bcrypt');

test('assert', () => {
    assert.ok(userService);
});

describe('userService', () => {
    it('creates a new user', async() => {
        const mockResponse = { username: 'John', password: '1234', teams: ['Liverpool', 'Chelsea'] };
        vi.spyOn(userRepo, 'createUser').mockResolvedValue(mockResponse);

        const result = await userService.signUp(mockResponse.username, mockResponse.password);

        expect(userRepo.createUser).toHaveBeenCalledWith( { username: 'John', password: expect.any(String) });
        expect(result).toEqual(mockResponse);
    });
    it('returns a user', async () => {
        const mockId = 1;
        const mockResponse = { name: 'John', password: '1234', teams: ['Liverpool', 'Chelsea'] };
        vi.spyOn(userRepo, 'getUserById').mockResolvedValue(mockResponse);

        const result = await userService.getUserById(mockId);

        expect(userRepo.getUserById).toHaveBeenCalledWith(mockId);
        expect(result).toEqual(mockResponse);
    });
    it('returns an updated user', async () => {
        const mockId = 1;
        const mockResponse = { name: 'John', password: '1234', teams: ['Liverpool', 'Chelsea'] };
        vi.spyOn(userRepo, 'updateUser').mockResolvedValue(mockResponse);

        const result = await userService.updateUser(mockId, mockResponse);

        expect(userRepo.updateUser).toHaveBeenCalledWith(mockId, mockResponse);
        expect(result).toEqual(mockResponse);
    });
    it('returns a signed in user', async () => {
        vi.spyOn(userRepo, 'getUserByName').mockResolvedValue({
            _id: 1,
            username: 'John',
            password: 'hashed',
        });
        vi.spyOn(bcrypt, 'compare').mockResolvedValue(true);

        const result = await userService.login('John', '1234');

        expect(result.user.username).toBe('John');
    });
    it('Shows a users budget'), async () => {
        const mockId = 1;
        const mockUser = new User({
            _id: mockId,
            username: 'John',
            password: 'hashed',
            budget: 10000,
        });
        vi.spyOn(userRepo, 'getUserById').mockResolvedValue(mockUser);
        const user = await userService.getUserById(mockId);
        expect(user.budget).toBe(10000);
    }
    it('Deleted a user', async () => {
        const mockId = 1;
        const mockUser = new User({
            _id: mockId,
            username: 'John',
            password: 'hashed',
        });
        vi.spyOn(userRepo, 'deleteUser').mockResolvedValue(mockUser);
        const result = await userService.deleteUser(mockId);
        expect(result).toEqual(mockUser);
    });
});
