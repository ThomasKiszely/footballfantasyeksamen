import { vi, assert, test, describe, beforeEach, expect, it } from 'vitest';

const userService = require('../src/services/userService');
const userRepo = require('../src/services/userRepo');
const User = require('../src/models/User');

test('assert', () => {
    assert.ok(userService);
});

describe('userService', () => {
    it('creates a new user', async() => {
        const mockResponse = { name: 'John', password: '1234', point: 0, budget: 0 };
        vi.spyOn(userRepo, 'createUser').mockResolvedValue(mockResponse);

        await userService.createUser(mockResponse);

        expect(mockResponse.name).toEqual('John');
        expect(mockResponse.password).toEqual('1234');
    });
    it('returns a user', async () => {
        const mockId = 1;
        const mockResponse = { name: 'John', password: '1234', point: 0, budget: 0 };
        vi.spyOn(userRepo, 'getUserById').mockResolvedValue(mockResponse);

        await userService.getUserById(mockId, mockResponse);

        expect(mockResponse.name).toEqual('John');
        expect(mockResponse.password).toEqual('1234');
    });
    it('returns an updated user', async () => {
        const mockId = 1;
        const mockResponse = { name: 'John', password: '1234', point: 0, budget: 0 };
        vi.spyOn(userRepo, 'updateUser').mockResolvedValue(mockResponse);

        await userService.updateUser(mockId, mockResponse);

        expect(mockResponse.name).toEqual('John');
        expect(mockResponse.password).toEqual('1234');
    });
})
//vi.spyOn(console, 'log')