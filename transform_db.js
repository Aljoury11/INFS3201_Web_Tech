"use strict";

const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

const config = require("./config.json");
const url = config.mongoUri;

async function run() {
    const client = await MongoClient.connect(url);
    const db = client.db();

    const shifts = db.collection("shifts");
    const employees = db.collection("employees");
    const assignments = db.collection("assignments");

    // Step 1
    await shifts.updateMany(
        { employees: { $exists: false } },
        { $set: { employees: [] } }
    );

    console.log("Step 1 finished");

    // Step 2
    const allAssignments = await assignments.find().toArray();

    let i = 0;
    while (i < allAssignments.length) {
        const oneAssignment = allAssignments[i];

        const employee = await employees.findOne({
            employeeId: oneAssignment.employeeId
        });

        const shift = await shifts.findOne({
            shiftId: oneAssignment.shiftId
        });

        if (employee !== null && shift !== null) {
            await shifts.updateOne(
                { _id: shift._id },
                { $push: { employees: employee._id } }
            );
        }

        i = i + 1;
    }

    console.log("Step 2 finished");

    await client.close();
}

run();