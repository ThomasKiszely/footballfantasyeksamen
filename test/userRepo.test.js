import {vi, expect, describe} from 'vitest';
const userRepo = require('../src/data/userRepo')
const {connectToMongoDb} = require('src/app');


describe('userRepo', () => {

    beforeEach(connectToMongoDb);
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
        const testUser1 = {
            username: 'john',
            password: '123',
            point: 0,
            budget: 200
        };
        const testUser2 = {
            username: 'Ron69',
            password: 'Vingadium Laviosa',
            point: 0,
            budget: 200
        };

        const users = await userRepo.getAllUsers();

        expect (users).toBeDefined();
        expect(users.length).toBeGreaterThanOrEqual(2);
        expect(users).toEqual([
            expect.objectContaining({username: 'john'}),
            expect.objectContaining({username: 'Ron69'}),
        ])
    });

    it('Delete a user', async () => {
        let testUser1 = {
            username: 'john',
            password: '123',
            point: 0,
            budget: 200
        }
        const createdUser = await userRepo.createUser(testUser1);

        expect(createdUser._id).toBeDefined();

        const deleteResult = await userRepo.deleteUser(createdUser._id);

        expect(deleteResult._id).toEqual(createdUser._id);

    });
    it('Update a user', async () => {
        let testUser1 = {
            username: 'john',
            password: '123',
            point: 0,
            budget: 200
        }
        const createdUser = await userRepo.createUser(testUser1);
        expect(createdUser._id).toBeDefined();

        const updatedData = 'john123';

        const updatedUser = await userRepo.updateUser(createdUser._id, updatedData);

        expect(updatedUser.username).toEqual('john123');
    });
})
