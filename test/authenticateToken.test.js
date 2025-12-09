import { describe, it, expect, vi, afterEach } from 'vitest';
import jwt from 'jsonwebtoken';
import authenticateToken from '../src/middlewares/authMiddleware';

afterEach(() => {
    vi.restoreAllMocks();
});

describe('authMiddleware middleware', () => {
    it('returns 401 if no token is provided', () => {
        const req = { cookies: {}, originalUrl: '/api/test' }; // tilføj originalUrl
        const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
        const next = vi.fn();

        authenticateToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Token mangler' });
        expect(next).not.toHaveBeenCalled();
    });

    it('returns 403 if token is invalid', () => {
        const req = { cookies: { jwt: 'invalidtoken' }, originalUrl: '/api/test' };
        const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
        const next = vi.fn();

        vi.spyOn(jwt, 'verify').mockImplementation((token, secret, cb) => cb(new Error('invalid'), null));

        authenticateToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ message: 'Ugyldigt eller udløbet token' });
        expect(next).not.toHaveBeenCalled();
    });

    it('calls next and attaches user if token is valid', (done) => {
        const fakeUser = { id: 1, role: 'user' };
        const req = { cookies: { jwt: 'validtoken' }, originalUrl: '/api/test' };
        const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };

        const next = vi.fn(() => {
            // assertions inde i next, så vi ved det er kørt
            expect(req.user).toEqual(fakeUser);
            expect(next).toHaveBeenCalled();
            done();
        });

        vi.spyOn(jwt, 'verify').mockImplementation((token, secret, cb) => {
            cb(null, fakeUser); // kalder callback med det samme
        });

        authenticateToken(req, res, next);
    });
});


