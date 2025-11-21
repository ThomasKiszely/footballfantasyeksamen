import { describe, vi, expect, it } from 'vitest';
import mongoose from 'mongoose';

const { connectToMongo } = require('src/services/db');

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

describe("connectToMongo", () => {})

