const teamRepo = require("../data/teamRepo");

async function retrieveLeaderboard () {

    const teams = await teamRepo.getAllTeams();
    
    teams.sort((a, b) => b.points - a.points);
    return teams;
}
module.exports = { retrieveLeaderboard };