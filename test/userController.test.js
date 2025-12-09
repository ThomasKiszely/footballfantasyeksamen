import { vi, assert, test, beforeEach, describe, expect, it } from 'vitest';

const userController = require('../src/controllers/userController');
const userService = require('../src/services/userService');
const teamService = require('../src/services/teamService');

test('assert', () => {
    assert.ok(userController);
});

describe('userController', () => {
    let req, res, next;
    beforeEach(() => {
        req = { body: {} };
        res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
            cookie: vi.fn(),
            clearCookie: vi.fn(),
            send: vi.fn(),
        };
        next = vi.fn();
    });

    it('Should return status 200 and json (login)', async () => {
        const mockResponse = {
            token: 'abc123',
            user: { _id: 1, username: 'John', teams: ['Liverpool'], role: 'user' }
        };
        vi.spyOn(userService, 'login').mockResolvedValue(mockResponse);
        vi.spyOn(teamService, 'getTeamByUserId').mockResolvedValue(null);

        req.body = { username: 'John', password: '1234' };

        await userController.login(req, res, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            user: mockResponse.user,
            teamId: null,
        });
    });

    it('Should return 201 and created user (signup)', async () => {
        const mockResponse = {
            token: 'abc123',
            user: { _id: 1, username: 'John', teams: ['Liverpool'], role: 'user' }
        };
        vi.spyOn(userService, 'signUp').mockResolvedValue(mockResponse);
        vi.spyOn(teamService, 'getTeamByUserId').mockResolvedValue(null);

        req.body = { username: 'John', password: '1234' };

        await userController.signup(req, res, next);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            user: mockResponse.user,
            teamId: null,
        });
    });

    it('Should return status 200 and a user (update)', async () => {
        const mockResponse = { _id: 1, username: 'John', teams: ['Liverpool'] };
        vi.spyOn(userService, 'updateUser').mockResolvedValue(mockResponse);

        const req = {
            params: { id: 1 },
            body: mockResponse,
        };
        await userController.updateUser(req, res, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ success: true, updatedUser: mockResponse });
        expect(userService.updateUser).toHaveBeenCalledWith(1, mockResponse);
    });

    it('Should return status 204 (delete)', async () => {
        vi.spyOn(userService, 'deleteUser').mockResolvedValue(true);

        const req = { params: { id: 1 } };
        await userController.deleteUser(req, res, next);

        expect(res.status).toHaveBeenCalledWith(204);
        expect(userService.deleteUser).toHaveBeenCalledWith(1);
    });
});
