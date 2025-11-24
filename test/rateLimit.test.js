import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';

vi.mock('../src/services/db', () => ({
    connectToMongo: vi.fn()
}));

const { rateLimiter } = require('../src/middlewares/rateLimiter');

describe('Rate Limiter Middleware', () => {
    let app;

    beforeEach(() => {
        app = express();
        app.use(rateLimiter);
        app.get('/test', (req, res) => {
            res.status(200).json({message: 'success'});
        });
    });

    it('Should allow request if not exceeded the limit', async () => {
        const res = await request(app).get('/test');
        expect(res.status).toBe(200);
    });

    it('Should block requests if limit is exceeded', async () => {
        for (let i = 0; i < 100; i++) {
            await request(app).get('/test');
        }
        const res = await request(app).get('/test');
        expect(res.status).toBe(429);
    });
});

