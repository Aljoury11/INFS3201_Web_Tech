const { MongoClient } = require("mongodb");
const fs = require("fs");

async function testMongo() {
    console.log("Starting test...");

    const config = JSON.parse(fs.readFileSync("./config.json", "utf8"));

    const client = new MongoClient(config.mongoUri, {
        serverSelectionTimeoutMS: 20000
    });

    try {
        console.log("Connecting...");
        await client.connect();
        console.log("MongoDB connected: SUCCESS");

        const db = client.db("infs3201_winter2026");
        const result = await db.command({ ping: 1 });
        console.log("Ping result:", result);
    } catch (err) {
        console.log("MongoDB connected: FAILED");
        console.log(err.name + ": " + err.message);
    } finally {
        await client.close();
        console.log("Connection closed");
        process.exit(0);
    }
}

testMongo();