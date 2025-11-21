import { describe, it, expect, afterAll } from "vitest";
import express, {request} from 'express';

const app = express();
app.use(express.json());


// Denne test er udarbejdet under test-driven development iterationen. Den nedenstående funktion,
// gennemgår alle users og returnere dem.

describe('User Routes', () => {
    it('Should return a list of users', async () => {
            const response = await request(app).get('/api/users').expect(200);

            expect(response.length).toBeInstanceOf(Array);
    });

    it('Should create a user', async () => {
        const newUser = {
            username: 'Joachim',
            password: '1234',
        };

        const response = await request(app)
        .post('/api/users')
            .expect(201);
    })
})

