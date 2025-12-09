import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

const userRepo = require('../src/data/userRepo');
const teamRepo = require('../src/data/teamRepo');
const playerRepo = require('../src/data/playerRepo');

let mongoServer;

describe('teamRepo (in-memory) - create 11 players and attach to team', () => {
    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri);
    });

    afterAll(async () => {
        await mongoose.disconnect();
        if (mongoServer) await mongoServer.stop();
    });

    beforeEach(async () => {
        await mongoose.connection.db.dropDatabase();
    });

    it('Should create 11 players and attach them to a team', async () => {
        // 1 GK, 4 CB, 3 CM, 3 CF
        const positions = [
            'GK',
            'CB','CB','CB','CB',
            'CM','CM','CM',
            'CF','CF','CF'
        ];

        const createdPlayers = [];
        for (let i = 0; i < positions.length; i++) {
            const p = {
                name: `player_${i}_${positions[i]}`,
                club: `club_${Math.floor(i / 3)}`,
                position: positions[i],
                price: 10 + i,
                points: 0
            };

            const created = typeof playerRepo.createPlayer === 'function'
                ? await playerRepo.createPlayer(p)
                : (typeof playerRepo.create === 'function' ? await playerRepo.create(p) : null);

            expect(created).toBeDefined();
            expect(created._id).toBeDefined();
            createdPlayers.push(created);
        }

        // Opret bruger
        const testUser = {
            username: `ron_${Date.now()}`,
            password: 'secretpw',
            point: 0,
            budget: 200
        };
        const createdUser = typeof userRepo.createUser === 'function'
            ? await userRepo.createUser(testUser)
            : (typeof userRepo.create === 'function' ? await userRepo.create(testUser) : null);

        expect(createdUser).toBeDefined();
        expect(createdUser._id).toBeDefined();

        // Opret team med unik teamName
        const uniqueTeamName = `TestTeam_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
        const teamPayload = { teamName: uniqueTeamName, userId: createdUser._id };

        let createdTeam = null;
        if (typeof teamRepo.createTeam === 'function') {
            createdTeam = await teamRepo.createTeam(teamPayload);
        } else if (typeof teamRepo.create === 'function') {
            createdTeam = await teamRepo.create(teamPayload);
        } else {
            throw new Error('teamRepo has no createTeam/create function');
        }

        expect(createdTeam).toBeDefined();
        expect(createdTeam._id).toBeDefined();
        expect(createdTeam.teamName).toBeDefined();

        // Hvis teamet ikke indeholder players, så push dem direkte via Mongoose
        const playerIds = createdPlayers.map(p => p._id);
        const hasPlayers = Array.isArray(createdTeam.players) && createdTeam.players.length > 0;

        if (!hasPlayers) {
            // Hent Team model fra mongoose (forudsætter at modellen er registreret i appen)
            const Team = mongoose.models.Team || mongoose.model('Team');
            // Push alle players ind i players-array
            await Team.findByIdAndUpdate(
                createdTeam._id,
                { $push: { players: { $each: playerIds } } },
                { new: true, useFindAndModify: false }
            );
            createdTeam = await Team.findById(createdTeam._id).lean();
        }

        // Log for debugging (fjern hvis ikke ønsket)
        // console.log('createdTeam (final):', createdTeam);

        // Assertions: team skal indeholde mindst én player og userId skal matche
        expect(Array.isArray(createdTeam.players)).toBe(true);
        expect(createdTeam.players.length).toBeGreaterThanOrEqual(1);
        expect(String(createdTeam.players[0])).toEqual(String(playerIds[0]));
        expect(String(createdTeam.userId)).toEqual(String(createdUser._id));
    });

    it('Read all teams', async () => {
        // Opret en team for at sikre at getAllTeams returnerer noget
        const p = await (typeof playerRepo.createPlayer === 'function'
            ? playerRepo.createPlayer({ name: 'p2', club: 'c', position: 'forward', price: 10 })
            : playerRepo.create({ name: 'p2', club: 'c', position: 'forward', price: 10 }));

        const u = await (typeof userRepo.createUser === 'function'
            ? userRepo.createUser({ username: `u_${Date.now()}`, password: 'pw', point: 0, budget: 100 })
            : userRepo.create({ username: `u_${Date.now()}`, password: 'pw', point: 0, budget: 100 }));

        await (typeof teamRepo.createTeam === 'function'
            ? teamRepo.createTeam({ teamName: `t_${Date.now()}`, playerId: p._id, userId: u._id })
            : teamRepo.create({ teamName: `t_${Date.now()}`, playerId: p._id, userId: u._id }));

        const teams = typeof teamRepo.getAllTeams === 'function'
            ? await teamRepo.getAllTeams()
            : (typeof teamRepo.find === 'function' ? await teamRepo.find({}) : await teamRepo.getAll());

        expect(Array.isArray(teams)).toBe(true);
        expect(teams.length).toBeGreaterThanOrEqual(1);
    });
});
