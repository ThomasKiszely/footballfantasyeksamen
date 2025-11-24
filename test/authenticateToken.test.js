import { describe, it, expect, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import authenticateToken from '../src/middlewares/authMiddleware';

describe('authMiddleware middleware', () => {
    it('returns 401 if no token is provided', () => {
        const req = { headers: {} };
        const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
        const next = vi.fn();

        authenticateToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Token mangler' });
        expect(next).not.toHaveBeenCalled();
    });

    it('returns 403 if token is invalid', () => {
        const req = { headers: { authorization: 'Bearer invalidtoken' } };
        const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
        const next = vi.fn();

        vi.spyOn(jwt, 'verify').mockImplementation((token, secret, cb) => cb(new Error('invalid'), null));

        authenticateToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ message: 'Ugyldigt eller udløbet token' });
        expect(next).not.toHaveBeenCalled();
    });

    it('calls next and attaches user if token is valid', () => {
        const fakeUser = { id: 1, username: 'John' };
        const req = { headers: { authorization: 'Bearer validtoken' } };
        const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
        const next = vi.fn();

        vi.spyOn(jwt, 'verify').mockImplementation((token, secret, cb) => cb(null, fakeUser));

        authenticateToken(req, res, next);

        expect(req.user).toEqual(fakeUser);
        expect(next).toHaveBeenCalled();
    });
});
