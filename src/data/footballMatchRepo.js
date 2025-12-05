require('dotenv').config();
const apiKey = process.env.API_FOOTBALL_KEY;
const mongoose = require('mongoose');
const axios = require("axios");
const FootballMatch = require("../models/FootballMatch");


const fetchAllMatches = async() => {

    try {
        const response = await axios.get('https://api.football-data.org/v4/competitions/PL/matches', {
            headers: {'X-Auth-Token': apiKey},
        });
        const matches = response.data?.matches || [];
        return matches.map(match => new FootballMatch({
            matchId: match.id,
            utcDate: match.utcDate,
            status: match.status,
            competition: {
                name: match.competition.name,
                type: match.competition.type,
                emblem: match.competition.emblem
            },
            season: match.season?.startDate?.split('-')[0],
            matchday: match.matchday ?? null,
            homeTeam: match.homeTeam.name,
            awayTeam: match.awayTeam.name,
            homeScore: match.score.fullTime.home ?? null,
            awayScore: match.score.fullTime.away ?? null,
            winner: match.score.winner ?? null,
        }));
    } catch (error) {
        console.log('Fejl ved load af kamp i repo', error.message);
        return null;
    }
};

const saveToDB = async() => {
    const matches = await fetchAllMatches();
    if(!matches.length) return;
    try {
        const ops = matches.map(match => {
        const obj = match.toObject ? match.toObject() : match;
        delete obj._id;
            return {
                updateOne: {
                    filter: { matchId: obj.matchId },
                    update: { $set: obj },
                    upsert: true,
                }
            };
        });
    await FootballMatch.bulkWrite(ops);
        console.log(`${matches.length} kampe gemt/updated i databasen`);
    } catch (error) {
        console.log('Fejl ved gem af kamp i repo', error.message);
    }
}

async function createMatch(footballMatchData) {
    const newMatch = new FootballMatch(footballMatchData);
    return await newMatch.save();
}

async function getAllMatches() {
    try {
        return await FootballMatch.find({});
    } catch (error) {
        console.log('Fejl ved hentning af alle kampe', error.message);
        throw error;
    }
}

async function updateMatch(matchId, updateData) {
    return FootballMatch.findByIdAndUpdate(matchId, updateData, {new: true});
}


module.exports = {
    fetchAllMatches,
    saveToDB,
    createMatch,
    getAllMatches,
    updateMatch,
}