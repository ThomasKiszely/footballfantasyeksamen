import { describe, it, expect, afterAll } from "vitest";
import express from 'express';
import request from 'supertest';
import userRoutes from '../src/routes/userRoutes.js';

const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);

// Alle tests i denne klasse, er blevet udarbejdet under test-driven development iterationen.

describe('User Routes', () => {

    // Denne test er udarbejdet under test-driven development iterationen. Den nedenstående funktion,
    // gennemgår alle users og returnere dem.

    it('Should return a list of users', async () => {
        const response = await request(app).get('/api/users').expect(200);

        expect(response.body).toBeInstanceOf(Array);
    });

    // Denne test forsøger at oprette en ny bruger.

    it('Should create a user', async () => {
        const newUser = {
            username: 'Joachim',
            password: '1234',
        };

        const response = await request(app)
        .post('/api/users')
            .expect(201);

        expect(response.length).toHaveProperty('id');
        expect(response.body.name).toBe('Joachim');
    });

    // Denne test nedenstående returnere en liste af users med et givent ID

    it('Should return a list of users with a given ID', async () => {
        const response = await request(app)
        .post('/api/users/1')
        .expect(200)
        .expect('id');

        expect(response.length).toHaveProperty('id');
    });

    // Testen nedenstående opdatere en bruger

    it('Should update a user', async () => {
        const response = await request(app)
        .patch('/api/users')
        .expect(200)
        .expect('id');

        expect(response.body.name).toBe(updates.name);
    });

    // Denne test nedenstående sletter en bruger

    it('should delete a user', async () => {
        await request(app)
            .delete('/api/users/1')
            .expect(204);
    });

    // Denne test returnere 404 fejlkode, i tilfældet af brugeren ikke eksistere

    it('should return 404 for non-existent user', async () => {
        await request(app)
            .get('/api/users/9999')
            .expect(404);
    });
});

