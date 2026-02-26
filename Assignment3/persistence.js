"use strict";

const fs = require("fs/promises");
const { MongoClient } = require("mongodb");

const CONFIG_FILE = "config.json";
const DB_NAME = "infs3201_winter2026";

/**
 * Read MongoDB settings from config.json
 * @returns {Promise<{ mongoUri: string }>}
 */
async function loadSettings() {
  let text = await fs.readFile(CONFIG_FILE, "utf8");
  let data = JSON.parse(text);

  if (!data || typeof data.mongoUri !== "string") {
    throw new Error("Missing mongoUri in config.json");
  }

  const uri = data.mongoUri.trim();
  if (uri.length === 0) {
    throw new Error("Missing mongoUri in config.json");
  }

  return { mongoUri: uri };
}

/**
 * Helper to open database, run action, and close connection
 * @param {(db:any)=>Promise<any>} action
 * @returns {Promise<any>}
 */
async function runWithDb(action) {
  const settings = await loadSettings();
  const client = new MongoClient(settings.mongoUri);

  try {
    await client.connect();
    const db = client.db(DB_NAME);
    return await action(db);
  } finally {
    await client.close();
  }
}

/**
 * Get all employees
 * @returns {Promise<Array<{ employeeId:string, name:string, phone:string }>>}
 */
async function getAllEmployees() {
  return await runWithDb(async function (db) {
    const employees = await db.collection("employees").find({}).toArray();
    return employees;
  });
}

/**
 * Find one employee by id
 * @param {string} employeeId
 * @returns {Promise<{ employeeId:string, name:string, phone:string }|undefined>}
 */
async function findEmployee(employeeId) {
  return await runWithDb(async function (db) {
    const result = await db
      .collection("employees")
      .findOne({ employeeId: employeeId });

    if (result) {
      return result;
    }
    return undefined;
  });
}

/**
 * Get shifts assigned to an employee
 * @param {string} employeeId
 * @returns {Promise<Array<{shiftId:string,date:string,startTime:string,endTime:string}>>}
 */
async function getEmployeeShifts(employeeId) {
  return await runWithDb(async function (db) {
    const assignments = await db
      .collection("assignments")
      .find({ employeeId: employeeId })
      .toArray();

    const shiftIds = [];
    let index = 0;

    while (index < assignments.length) {
      shiftIds.push(assignments[index].shiftId);
      index++;
    }

    if (shiftIds.length === 0) {
      return [];
    }

    const shifts = await db
      .collection("shifts")
      .find({ shiftId: { $in: shiftIds } })
      .toArray();

    return shifts;
  });
}

/**
 * Update employee name and phone
 * @param {string} employeeId
 * @param {string} name
 * @param {string} phone
 * @returns {Promise<void>}
 */
async function updateEmployee(employeeId, name, phone) {
  await runWithDb(async function (db) {
    await db.collection("employees").updateOne(
      { employeeId: employeeId },
      { $set: { name: name, phone: phone } }
    );
  });
}

module.exports = {
  getAllEmployees,
  findEmployee,
  getEmployeeShifts,
  updateEmployee
};
