import { describe, it, expect, vi, beforeEach } from "vitest";
const footballMatchRepo = require("../src/data/footballMatchRepo");
const teamRepo = require("../src/data/teamRepo");

const { updateTeamPoints } = require("../src/services/teamPointsService");

const matchSchemaFields = {
    utcDate: '2025-12-05T18:00:00Z',
    status: "FINISHED",
    competition: { name: "Premier League", type: "LEAGUE", emblem: "http://example.com/emblem.png" },
    season: "2024/2025",
    matchday: 1,
};

const createFakeTeamDocument = (data) => ({
    ...data,
    save: vi.fn(),
    toObject: vi.fn(() => ({ ...data, detailedGameweekPoints: new Map() })),
});

describe("teamPointsService", () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it("Should award 3 points when team wins as home", async () => {
        const fakeFullPlayers = [
            { _id: "id_salah", name: "Salah", club: "Liverpool" },
            { _id: "id_vandijk", name: "Van Dijk", club: "Liverpool" }
        ];

        // Holdet FØR opdatering
        const fakeTeamInput = createFakeTeamDocument({
            _id: "team1",
            players: fakeFullPlayers,
            points: 0,
        });

        // Holdet EFTER opdatering (Output)
        const fakeTeamOutput = createFakeTeamDocument({
            _id: "team1",
            players: fakeFullPlayers,
            points: 6,
        });

        const fakeMatches = [
            {
                _id: "match_id_1",
                __v: 0,
                matchId: 1,
                ...matchSchemaFields,
                homeTeam: "Liverpool",
                awayTeam: "Chelsea",
                winner: "HOME_TEAM",
                homeScore: 2,
                awayScore: 0
            }
        ];

        // Mocks skal returnere I DENNE RÆKKEFØLGE:

        // 1. Første kald til getTeamById (til input)
        vi.spyOn(teamRepo, "getTeamById").mockResolvedValueOnce(fakeTeamInput);

        // 2. Mock footballMatchRepo
        vi.spyOn(footballMatchRepo, "getAllMatches").mockResolvedValue(fakeMatches);

        // 3. Mock updateTeam (selve gemme-kaldet)
        vi.spyOn(teamRepo, "updateTeam").mockImplementation(async (id, data) => data);

        // 4. Andet kald til getTeamById (til formatTeamOutput)
        vi.spyOn(teamRepo, "getTeamById").mockResolvedValueOnce(fakeTeamOutput);

        const updatedTeam = await updateTeamPoints("team1");

        expect(updatedTeam.points).toBe(6);
    });

    it("Should award 1 points if its draw", async () => {
        const fakeFullPlayers = [
            { _id: "id_sterling", name: "Sterling", club: "Chelsea" }
        ];

        // Holdet FØR opdatering (Input)
        const fakeTeamInput = createFakeTeamDocument({
            _id: "team2",
            players: fakeFullPlayers,
            points: 0,
        });

        // Holdet EFTER opdatering (Output)
        const fakeTeamOutput = createFakeTeamDocument({
            _id: "team2",
            players: fakeFullPlayers,
            points: 1, // Forventet output
        });

        const fakeMatches = [
            {
                _id: "match_id_2",
                __v: 0,
                matchId: 2,
                ...matchSchemaFields,
                homeTeam: "Liverpool",
                awayTeam: "Chelsea",
                winner: "DRAW",
                homeScore: 1,
                awayScore: 1
            }
        ];

        // Mock FØRSTE kald (Input data)
        vi.spyOn(teamRepo, "getTeamById").mockResolvedValueOnce(fakeTeamInput);

        vi.spyOn(footballMatchRepo, "getAllMatches").mockResolvedValue(fakeMatches);

        vi.spyOn(teamRepo, "updateTeam").mockImplementation(async (id, data) => data);

        // Mock ANDET kald (Output data)
        vi.spyOn(teamRepo, "getTeamById").mockResolvedValueOnce(fakeTeamOutput);

        const updatedTeam = await updateTeamPoints("team2");

        expect(updatedTeam.points).toBe(1);
    });

    it("Should award 0 if its a loss", async () => {
        const fakeFullPlayers = [
            { _id: "id_sterling", name: "Sterling", club: "Chelsea" }
        ];

        // Holdet FØR opdatering (Input)
        const fakeTeamInput = createFakeTeamDocument({
            _id: "team3",
            players: fakeFullPlayers,
            points: 0,
        });

        // Holdet EFTER opdatering (Output, stadig 0)
        const fakeTeamOutput = createFakeTeamDocument({
            _id: "team3",
            players: fakeFullPlayers,
            points: 0, // Forventet output
        });

        const fakeMatches = [
            {
                _id: "match_id_3",
                __v: 0,
                matchId: 3,
                ...matchSchemaFields,
                homeTeam: "Liverpool",
                awayTeam: "Chelsea",
                winner: "HOME_TEAM", // Chelsea taber
                homeScore: 1,
                awayScore: 0
            }
        ];

        // Mock FØRSTE kald
        vi.spyOn(teamRepo, "getTeamById").mockResolvedValueOnce(fakeTeamInput);

        vi.spyOn(footballMatchRepo, "getAllMatches").mockResolvedValue(fakeMatches);

        vi.spyOn(teamRepo, "updateTeam").mockImplementation(async (id, data) => data);

        // Mock ANDET kald
        vi.spyOn(teamRepo, "getTeamById").mockResolvedValueOnce(fakeTeamOutput);

        const updatedTeam = await updateTeamPoints("team3");

        expect(updatedTeam.points).toBe(0);
    });
});