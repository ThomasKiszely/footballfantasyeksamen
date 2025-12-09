/**
* @vitest-environment node
  */
require('dotenv').config();
import {describe, it, expect, vi} from "vitest";
import axios from 'axios';
import {builtinEnvironments} from "vitest/environments";
const apiKey = process.env.API_FOOTBALL_KEY


describe('Live API test', () => {
    it('Fetches data from real life football matches', async () => {
        const response = await axios.get('https://api.football-data.org/v4/competitions/PL/matches', {
            headers: {'X-Auth-Token': apiKey},
        });
        const matchData = response.data.matches;
        expect(response.status).toBe(200);
        expect(Array.isArray(matchData)).toBe(true);
        expect(matchData.length).toBeGreaterThan(0);
        expect(matchData[0]).toHaveProperty('id');
    });
});