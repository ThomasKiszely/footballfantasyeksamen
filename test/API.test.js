import {describe, it, expect, vi} from "vitest";
import axios from 'axios';

describe('Live API test', () => {
    it('Fetches data from real life football matches', async () => {
        const response = await axios.get('https://api.football-data.org/v4/competitions/PL/matches');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.data)).toBe(true);
        expect(response.data.length).toBeGreaterThan(0);
        expect(response.data[0]).toHaveProperty('name');
    });
});