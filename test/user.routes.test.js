import { describe, it, expect, vi, beforeAll } from 'vitest';
import request from 'supertest';

vi.mock('../src/services/db', () => ({
    connectToMongo: vi.fn()
}));

const app = require('../src/app');

describe('User Routes', () => {
    it('Should return 200 and an array of users', async () => {
        const res = await request(app).get('/api');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it('Should return 404 for invalid user ID', async () => {
        const fakeId = '507f1f77bcf86cd799439011';
        const res = await request(app).get(`/api/${fakeId}`);
        expect(res.status).toBe(404);
    });

    it('Should return 201 when creating a user', async () => {
        const newUser = {
            username: 'testuser',
            password: '1234'
        };
        const res = await request(app).post('/api').send(newUser);
        expect(res.status).toBe(201);
    });

    it('Should return 400 for invalid user data', async () => {
        const invalidUser = {
            username: ''
        };
        const res = await request(app).post('/api').send(invalidUser);
        expect(res.status).toBe(400);
    });

    it('Should return 200 when updating a user', async () => {
        const userId = '507f1f77bcf86cd799439011';
        const res = await request(app).put(`/api/${userId}`).send({
            username: 'updated',
            password: '5678'
        });
        expect(res.status).toBe(200);
    });

    it('Should return 200 when deleting a user', async () => {
        const userId = '507f1f77bcf86cd799439011';
        const res = await request(app).delete(`/api/${userId}`);
        expect(res.status).toBe(200);
    });
});