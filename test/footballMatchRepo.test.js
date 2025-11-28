import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from "vitest";
const mongoose = require("mongoose");
const {MongoMemoryServer} = require("mongodb-memory-server");


vi.mock("axios", () => {
    return { get: vi.fn() };
});

const axios = require("axios");
const footballMatchRepo = require("../src/data/footballMatchRepo");


describe("footballMatchRepo", () => {
    it("Should return a list of matches from api", async () => {

        axios.get = vi.fn(() =>
            Promise.resolve({
                data: {
                    matches: [
                        {
                            id: 432101,
                            utcDate: "2025-11-24T15:00:00Z",
                            status: "FINISHED",
                            competition: { name: "Premier League", type: "League", emblem: "..." },
                            season: { startDate: "2025-08-01" },
                            matchday: 13,
                            homeTeam: { name: "Man Utd" },
                            awayTeam: { name: "Chelsea" },
                            score: { fullTime: { home: 2, away: 1 } }
                        }
                    ]
                }
            })
        );

        const matches = await footballMatchRepo.fetchAllMatches();

        expect(matches).toBeInstanceOf(Array);
        expect(matches.length).toBe(1);

        const match = matches[0];
        expect(match.matchId).toEqual(432101);
        expect(match.homeTeam).toEqual("Man Utd");
        expect(match.awayTeam).toEqual("Chelsea");
        expect(match.homeScore).toEqual(2);
        expect(match.awayScore).toEqual(1);
        expect(match.status).toEqual("FINISHED");
    });
});


const FootballMatch = { bulkWrite: vi.fn() };
const fetchAllMatchesMock = vi.spyOn(footballMatchRepo, "fetchAllMatches");


const saveToDB = async () => {
    const matches = await footballMatchRepo.fetchAllMatches();
    if (!matches || !matches.length) return;

    const ops = matches.map(match => ({
        updateOne: {
            filter: { matchId: match.matchId },
            update: { $set: match },
            upsert: true,
        },
    }));
    await FootballMatch.bulkWrite(ops);
};

describe("saveToDB", () => {
    beforeEach(() => {
        FootballMatch.bulkWrite.mockClear();
    });

    it("Calling bulkWrite with correct ops if there are matches", async () => {
        const fakeMatches = [
            { matchId: 432101, homeTeam: "Man Utd", awayTeam: "Chelsea" },
            { matchId: 432102, homeTeam: "Liverpool", awayTeam: "Arsenal" },
        ];

        fetchAllMatchesMock.mockResolvedValue(fakeMatches);

        await saveToDB();

        expect(FootballMatch.bulkWrite).toHaveBeenCalledTimes(1);
        const opsArg = FootballMatch.bulkWrite.mock.calls[0][0];

        expect(opsArg).toEqual([
            {
                updateOne: {
                    filter: { matchId: 432101 },
                    update: { $set: expect.objectContaining({ matchId: 432101 }) },
                    upsert: true,
                },
            },
            {
                updateOne: {
                    filter: { matchId: 432102 },
                    update: { $set: expect.objectContaining({ matchId: 432102 }) },
                    upsert: true,
                },
            },
        ]);
    });

    it("does not call bulkWrite when no matches", async () => {
        fetchAllMatchesMock.mockResolvedValue([]);
        await saveToDB();
        expect(FootballMatch.bulkWrite).not.toHaveBeenCalled();
    });
});

describe("CRUD Operations", () => {

    let mongoServer;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        await mongoose.connect(mongoServer.getUri());
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    it('Should be able to read all matches', async () => {
        let testMatch = {
            matchId: 432105,
            utcDate: "2025-11-24T15:00:00Z",
            status: "FINISHED",
            competition: { name: "Premier League", type: "League", emblem: "..." },
            season: "2025-08-01",
            matchday: 13,
            homeTeam: "Man Utd",
            awayTeam: "Chelsea",
            homeScore: 2,
            awayScore: 1,
            winner: "HOME_TEAM"
        };
        const createdMatch = await footballMatchRepo.createMatch(testMatch);
        const matches = await footballMatchRepo.getAllMatches();

        expect(matches).toBeInstanceOf(Array);
        expect(matches.length).toBeGreaterThan(0);

        const match = matches[0];
        expect(match.homeTeam).toEqual("Man Utd");
        expect(match.awayTeam).toEqual("Chelsea");
    });
})
