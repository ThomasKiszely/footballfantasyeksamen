import { describe, it, expect, beforeAll, afterAll } from "vitest";
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const { connectToMongo } = require("../src/services/db.js");

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    process.env.DB_URL = mongoServer.getUri();
});

afterAll(async () => {
    await mongoose.connection.close();
    await mongoServer.stop();
});

describe("MongoDB connection", () => {
    it("connects to MongoDB", async () => {
        connectToMongo();

        await new Promise((resolve, reject) => {
            mongoose.connection.once("open", resolve);
            mongoose.connection.once("error", reject);
        });

        expect(mongoose.connection.readyState).toBe(1);
    });
});
