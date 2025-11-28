import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from "vitest";
const footballMatchRepo = require("../src/data/footballMatchRepo");
const teamRepo = require("../src/data/teamRepo");

const {updateTeamPoints} = require("../src/services/teamPointsService");

describe("teamPointsService", () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it("Should award 3 points when team wins as home", async () => {
       const fakeTeam = {
           _id: "team1",
           players: [
               { name: "Salah", club: "Liverpool" },
               { name: "Van Dijk", club: "Liverpool" }
           ],
           points: 0,
           save: vi.fn()
       };

       const fakeMatches = [
           { matchId: 1, homeTeam: "Liverpool", awayTeam: "Chelsea", winner: "HOME_TEAM" }
       ];

        vi.spyOn(teamRepo, "getTeamById").mockResolvedValue(fakeTeam);
        vi.spyOn(footballMatchRepo, "getAllMatches").mockResolvedValue(fakeMatches);
       const saveSpy = vi.spyOn(teamRepo, "saveTeam").mockImplementation(async t => t);

        const updatedTeam = await updateTeamPoints("team1");

        expect(updatedTeam.points).toBe(6);
        expect(saveSpy).toHaveBeenCalled(fakeTeam);
    });

    it("Should award 1 points if its draw", async () => {
        const fakeTeam = {
            _id: "team2",
            players: [{ name: "Sterling", club: "Chelsea" }],
            points: 0,
            save: vi.fn()
        };

        const fakeMatches = [
            { matchId: 2, homeTeam: "Liverpool", awayTeam: "Chelsea", winner: "DRAW" }
        ];

        vi.spyOn(teamRepo, "getTeamById").mockResolvedValue(fakeTeam);
        vi.spyOn(footballMatchRepo, "getAllMatches").mockResolvedValue(fakeMatches);
        vi.spyOn(teamRepo, "saveTeam").mockImplementation(async t => t);

        const updatedTeam = await updateTeamPoints("team2");

        expect(updatedTeam.points).toBe(1);
    });


    it("Should award 0 if its a loss", async () => {
        const fakeTeam = {
            _id: "team3",
            players: [{ name: "Sterling", club: "Chelsea" }],
            points: 0,
            save: vi.fn()
        };

        const fakeMatches = [
            { matchId: 3, homeTeam: "Liverpool", awayTeam: "Chelsea", winner: "HOME_TEAM" }
        ];

        vi.spyOn(teamRepo, "getTeamById").mockResolvedValue(fakeTeam);
        vi.spyOn(footballMatchRepo, "getAllMatches").mockResolvedValue(fakeMatches);
        vi.spyOn(teamRepo, "saveTeam").mockImplementation(async t => t);

        const updatedTeam = await updateTeamPoints("team3");

        expect(updatedTeam.points).toBe(0);
    });
})