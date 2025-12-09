import { describe, it, expect, vi, afterAll } from 'vitest';
import request from 'supertest';

vi.mock('../src/services/db', () => ({
    connectToMongo: vi.fn()
}));

const app = require('../src/app');

describe('User Routes (with JWT)', () => {
    const username = `testuser_${Date.now()}`;
    const password = '1234';

    let createdUserId;
    let cookieHeader; // gem hele cookie header array

    it('Should create a new user and return 201', async () => {
        const res = await request(app)
            .post('/api/user/signup')
            .send({ username, password });

        expect(res.status).toBe(201);
        expect(res.body.user.username).toBe(username);

        createdUserId = res.body.user._id;

        // Hent cookie fra Set-Cookie header (Express sætter jwt cookie)
        const setCookie = res.headers['set-cookie'];
        expect(setCookie).toBeDefined();
        cookieHeader = setCookie; // gem arrayet direkte, supertest kan bruge det
    });

    it('Should login and return 200 with cookie (same user)', async () => {
        const res = await request(app)
            .post('/api/user/login')
            .send({ username, password });

        expect(res.status).toBe(200);
        expect(res.body.user.username).toBe(username);

        // login kan også sætte cookie; opdater cookieHeader hvis den gør
        const setCookie = res.headers['set-cookie'];
        if (setCookie) cookieHeader = setCookie;
        expect(cookieHeader).toBeDefined();
    });

    it('Should update user when authorized', async () => {
        const res = await request(app)
            .put(`/api/user/${createdUserId}`)
            .set('Cookie', cookieHeader) // brug hele header array
            .send({ username: `${username}_updated`, password: '5678' });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.updatedUser.username).toBe(`${username}_updated`);
    });

    it('Should delete user when authorized', async () => {
        const res = await request(app)
            .delete(`/api/user/${createdUserId}`)
            .set('Cookie', cookieHeader);

        expect(res.status).toBe(204);
    });

    afterAll(async () => {
        // best-effort cleanup hvis noget gik galt tidligere
        if (createdUserId) {
            await request(app)
                .delete(`/api/${createdUserId}`)
                .set('Cookie', cookieHeader || []);
        }
    });
});
