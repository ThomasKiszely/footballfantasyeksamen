import { vi, expect, describe, it, beforeEach } from 'vitest';
const userRepo = require('../src/data/userRepo');

describe('userRepo', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('Should create a user', async () => {
        const fakeuser = ({
            username: 'john',
            password: '123',
            teams: ['HotSpurs']
        });
        vi.spyOn(userRepo, 'createUser').mockResolvedValue(fakeuser);

        const user = await userRepo.createUser(fakeuser);

        expect(user).toEqual(
            expect.objectContaining({
                username: 'john',
                password: '123',
                teams: ['HotSpurs']
            })
        );
    });

    it('Read all users', async () => {
        const fakeUsers = [
            { username: 'john', password: '123', teams: ['HotSpurs'] },
            { username: 'Ron69', password: 'Vingadium Laviosa', teams: ['HotSpurs'] },
        ];

        vi.spyOn(userRepo, 'getAllUsers').mockResolvedValue(fakeUsers);

        const users = await userRepo.getAllUsers();

        expect(users).toBeDefined();
        expect(users.length).toBeGreaterThanOrEqual(2);
        expect(users).toEqual([
            expect.objectContaining({ username: 'john' }),
            expect.objectContaining({ username: 'Ron69' }),
        ]);
    });

    it('Returns a user from id', async () => {
        const fakeUser = { username: 'john', password: '123', teams: ['HotSpurs'] };
        vi.spyOn(userRepo, 'getUserById').mockResolvedValue(fakeUser);

        const user = await userRepo.getUserById(1);

        expect(user.username).toBe('john');
    });

    it('Returns a user from name', async () => {
        const fakeUser = { username: 'john', password: '123', teams: ['HotSpurs'] };
        vi.spyOn(userRepo, 'getUserByName').mockResolvedValue(fakeUser);

        const user = await userRepo.getUserByName(fakeUser.username);

        expect(user.username).toBe('john');
    });

    it('Deletes a user', async () => {
        const testUser1 = { _id: 1, username: 'john', password: '123', teams: ['HotSpurs'] };
        vi.spyOn(userRepo, 'deleteUser').mockResolvedValue(testUser1);

        const deleteResult = await userRepo.deleteUser(testUser1._id);

        expect(deleteResult._id).toEqual(testUser1._id);
    });

    it('Update a user', async () => {
        const id = 1;
        const mockResponse = { username: 'john', password: '123', teams: ['HotSpurs'] };
        vi.spyOn(userRepo, 'updateUser').mockResolvedValue(mockResponse);

        const updatedUser = await userRepo.updateUser(id, mockResponse);

        expect(updatedUser.username).toBe('john');
    });
});
