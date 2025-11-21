import {vi, expect, describe} from "vitest";
const userRepo = require('../src/data/userRepo');
const teamRepo = require('../src/data/teamRepo')
const playerRepo = require('../src/data/playerRepo')
const {connectToMongoDb} = require('src/app');


describe('teamRepo', () => {

    beforeEach(connectToMongoDb);
    it('Should create a team', async () => {
        const testPlayer = {
            name: 'testPlayer',
            club: 'testClub',
            price: 50,
        }
        const testUser1 = {
            username: 'Ron69',
            password: 'Vingadium Laviosa',
            point: 0,
            budget: 200
        }
        const createdPlayer = await playerRepo.createPlayer(testPlayer)
        expect(createdPlayer._id).toBeDefined();
        const createdUser = await userRepo.createUser(testUser1);
        expect(createdUser._id).toBeDefined();

        const createdTeam = await teamRepo.createTeam({playerId: createdPlayer._id, userId: createdUser._id});

        expect(createdTeam._id).toBeDefined();
        expect(createdTeam.userId).toEqual(createdUser._id);
        expect(createdTeam.playerId).toEqual(createdPlayer._id);


    });

    it('Read all teams', async () => {
        const teams = await teamRepo.find({});
    })
})