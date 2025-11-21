import {vi, expect, describe} from 'vitest';
const userRepo = require('../src/data/userRepo')
const {connectToMongoDb} = require('src/app');


describe('userRepo', () => {

    beforeEach(connectToMongoDb);
    it('Should create a user', async () => {
        let user;
        user = await userRepo.createUser({username: 'john', password: '123', point: '0'});

        expect(user).toEqual(expect.objectContaining({
            username: 'john',
            password: '123',
            point: '0'
        }));
    });


    it('Read all users', async () => {
        const testUser1 = {
            username: 'john',
            password: '123',
            point: '0'
        };
        const testUser2 = {
            username: 'Ron69',
            password: 'Vingadium Laviosa',
            point: '0'
        };

        const users = await userRepo.getAllUsers();

        expect (users).toBeDefined();
        expect(users.length).toBeGreaterThanOrEqual(2);
        expect(users).toEqual([
            expect.objectContaining({username: 'john'}),
            expect.objectContaining({username: 'Ron69'}),
        ])
    });
})
