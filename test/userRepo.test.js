import { vi, expect, describe, beforeEach, it } from 'vitest';

const userRepo = require('../src/data/userRepo')
const { connectToMongo } = require('../src/services/db');


describe('userRepo', () => {

    beforeEach(async () => {
        await connectToMongo();
    });
    it('Should create a user', async () => {
        let user;
        user = await userRepo.createUser({username: 'john', password: '123', point: 0, budget: 200});

        expect(user).toEqual(expect.objectContaining({
            username: 'john',
            password: '123',
            point: 0,
            budget: 200
        }));
    });


    it('Read all users', async () => {
        const fakeUsers = [
            { username: 'john', password: '123', point: 0, budget: 200 },
        { username: 'Ron69', password: 'Vingadium Laviosa', point: 0, budget: 200 }
        ];

        vi.spyOn(userRepo, 'getAllUsers').mockResolvedValue(fakeUsers);

        const users = await userRepo.getAllUsers();

        expect (users).toBeDefined();
        expect(users.length).toBeGreaterThanOrEqual(2);
        expect(users).toEqual([
            expect.objectContaining({username: 'john'}),
            expect.objectContaining({username: 'Ron69'}),
        ]);
    });

    it('Delete a user', async () => {
        let testUser1 = {
            username: 'john',
            password: '123',
            point: 0,
            budget: 200
        }
        vi.spyOn(userRepo, 'deleteUser').mockResolvedValue(testUser1);

        const deleteResult = await userRepo.deleteUser(testUser1._id);

        expect(deleteResult._id).toEqual(testUser1._id);

    });
    it('Update a user', async () => {
        const id = 1;
        const mockResponse = {
            username: 'john',
            password: '123',
            point: 0,
            budget: 200
        }

        vi.spyOn(userRepo, 'updateUser').mockResolvedValue(mockResponse);

        const updatedUser = await userRepo.updateUser(id, mockResponse);

        expect(updatedUser.username).toBe('john');
    });
})
