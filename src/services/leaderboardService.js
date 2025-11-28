const teamRepo = require("../data/teamRepo");
const {getAllTeams} = require("../data/teamRepo");

async function retrieveLeaderboard () {
    const teams = getAllTeams();
    teams.sort((a, b) => b.points - a.points)
}