import { describe, vi, expect, it } from 'vitest';
import mongoose from 'mongoose';

import { connectToMongo } from 'src/services/db';

vi.mock("mongoose", () => {
    return {
        default: {
            connect: vi.fn(),
            connection: {
                on: vi.fn(),
                once: vi.fn(),
                close: vi.fn(),
            },
        },
    };
});

describe("connectToMongo", () => {
    it('Should call mongoose.connectToMongo with db_url', async () => {
        process.env.DB_URL = "mongodb://localhost:27017/testdb";
        await connectToMongo();
        expect(mongoose.connect(process.env.DB_URL)).toHaveBeenCalledWith(process.env.DB_URL);
    });
})

