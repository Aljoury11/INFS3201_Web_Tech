"use strict";

const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

// read database url from config file
const config = require("./config.json");
const url = config.mongoUri;

async function run() {

    // connect to database
    const client = await MongoClient.connect(url);
    const db = client.db();

    const shifts = db.collection("shifts");

    // add employees array if it does not exist
    await shifts.updateMany(
        { employees: { $exists: false } },
        { $set: { employees: [] } }
    );

    console.log("Step 1 finished");

    await client.close();
}

run();