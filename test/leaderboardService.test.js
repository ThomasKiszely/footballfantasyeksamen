import { describe, it, expect, vi } from "vitest";
const leaderboardService = require("../src/services/leaderboardService");
const teamRepo = require("../src/data/teamRepo");

describe("Leaderboard Service", () => {
    it("Should return teams sorted by points (highest first)", async () => {
        const fakeTeams = [
            { teamName: "Hold A", points: 10 },
            { teamName: "Hold B", points: 50 },
            { teamName: "Hold C", points: 30 }
        ];

        vi.spyOn(teamRepo, "getAllTeams").mockResolvedValue(fakeTeams);

        const sortedTeams = await leaderboardService.retrieveLeaderboard();

        expect(sortedTeams[0].teamName).toBe("Hold B");
        expect(sortedTeams[1].teamName).toBe("Hold C");
        expect(sortedTeams[2].teamName).toBe("Hold A");
        expect(sortedTeams.length).toBe(3);
    });
});