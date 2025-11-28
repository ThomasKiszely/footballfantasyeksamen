import { vi, assert, test, beforeEach, describe, expect, it } from 'vitest';

const userController = require('../src/controllers/userController');
const userService = require('../src/services/userService');

test('assert', () => {
    assert.ok(userController);
});

describe('userController', () => {
    let req, res, next;
    beforeEach(() => {
        req = {body: {} };
        res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        };
        next = vi.fn();
    });
    it('Should return status 200 and json', async () => {
        const mockResponse = { _id: 1, name: 'John', password: '1234' };
        vi.spyOn(userService, 'login').mockResolvedValue(mockResponse);

        req.body = mockResponse;

        await userController.login(req, res, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            user: { id: mockResponse._id, username: mockResponse.username },
        });
    });
    it('Should return 201 and created user', async () => {
        const mockResponse = { name: 'John', password: '1234', teams: ['Liverpool'] };
        vi.spyOn(userService, 'signUp').mockResolvedValue(mockResponse);

        req.body = { name: 'John', password: '1234' };
        await userController.signup(req, res, next);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            user: { id: mockResponse._id, username: mockResponse.username },
        });
    });/*
    it('Should return status 200 and a user', async () => {
        const mockResponse = { name: 'John', password: '1234', teams: ['Liverpool'] };
        vi.spyOn(userService, 'getUserById').mockResolvedValue(mockResponse);


        const req = ({
        params: {id: 1},
        body: { name: 'John', password: '1234', teams: ['Liverpool'] },
    });
        await userController.getUserById(req, res, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockResponse);
        expect(userService.getUserById).toHaveBeenCalledWith(1);
    });*//*
    it('Should return status 200 and a user', async () => {
        const mockResponse = { name: 'John', password: '1234', teams: ['Liverpool'] };
        vi.spyOn(userService, 'updateUser').mockResolvedValue(mockResponse);

        const req = ({
            params: {id: 1},
            body: { name: 'John', password: '1234', teams: ['Liverpool'] },
        });
        await userController.updateUser(req, res, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockResponse);
        expect(userService.updateUser).toHaveBeenCalledWith(1);
    }); *//*
    it('Should return status 204', async () => {
        const mockResponse = { name: 'John', password: '1234', teams: ['Liverpool'] };
        vi.spyOn(userService, 'deleteUser').mockResolvedValue(mockResponse);

        const req = ({
            params: {id: 1},
            body: { name: 'John', password: '1234', point: 0, budget: 0 }
        });
        await userController.deleteUser(req, res, next);

        expect(res.status).toHaveBeenCalledWith(204);
        expect(userService.deleteUser).toHaveBeenCalledWith(1);
    });*/
})



/*
describe('Create user', async () => {
    const req = { body: { name: 'John', password: '123456', point: '0', budget: '0' } };

    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
    };

    await userController.createUser(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ name: 'John', password: '123456', point: '0', budget: '0' });
});
 */

