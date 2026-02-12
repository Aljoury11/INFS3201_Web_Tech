const CONFIG_FILE = "config.json";
"use strict";
const fs = require("fs/promises");
const EMPLOYEES_FILE = "employees.json";
const SHIFTS_FILE = "shifts.json";
const ASSIGNMENTS_FILE = "assignments.json";

/**
 * Return a list of all employees loaded from storage.
 * @returns {Promise<Array<{ employeeId: string, name: string, phone: string }>>}
 */
async function getAllEmployees() {
  const rawData = await fs.readFile(EMPLOYEES_FILE, "utf8");
  return JSON.parse(rawData);
}

/**
 * Find a single employee by ID.
 * @param {string} empId - Employee ID (e.g., E001).
 * @returns {Promise<{ employeeId: string, name: string, phone: string }|undefined>}
 */
async function findEmployee(empId) {
  const rawData = await fs.readFile(EMPLOYEES_FILE, "utf8");
  const employeeList = JSON.parse(rawData);

  for (let i = 0; i < employeeList.length; i++) {
    if (employeeList[i].employeeId === empId) {
      return employeeList[i];
    }
  }
  return undefined;
}

/**
 * Find a single shift by ID.
 * @param {string} shiftId - Shift ID (e.g., S001).
 * @returns {Promise<{shiftId:string, date:string, startTime:string, endTime:string}|undefined>}
 */
async function findShift(shiftId) {
  const rawData = await fs.readFile(SHIFTS_FILE, "utf8");
  const shiftList = JSON.parse(rawData);

  for (let i = 0; i < shiftList.length; i++) {
    if (shiftList[i].shiftId === shiftId) {
      return shiftList[i];
    }
  }
  return undefined;
}

/**
 * Find an assignment by employeeId and shiftId.
 * @param {string} empId - Employee ID.
 * @param {string} shiftId - Shift ID.
 * @returns {Promise<{employeeId:string, shiftId:string}|undefined>}
 */
async function findAssignment(empId, shiftId) {
  const rawData = await fs.readFile(ASSIGNMENTS_FILE, "utf8");
  const assignmentList = JSON.parse(rawData);

  for (let i = 0; i < assignmentList.length; i++) {
    if (assignmentList[i].employeeId === empId && assignmentList[i].shiftId === shiftId) {
      return assignmentList[i];
    }
  }
  return undefined;
}

/**
 * Add a new assignment to the assignments file (no validation here).
 * @param {string} empId - Employee ID.
 * @param {string} shiftId - Shift ID.
 * @returns {Promise<void>}
 */
async function addAssignment(empId, shiftId) {
  const rawData = await fs.readFile(ASSIGNMENTS_FILE, "utf8");
  const assignmentList = JSON.parse(rawData);

  assignmentList.push({ employeeId: empId, shiftId: shiftId });
  await fs.writeFile(ASSIGNMENTS_FILE, JSON.stringify(assignmentList, null, 4), "utf8");
}

/**
 * Add a new employee record and auto-generate the next employeeId.
 * @param {{name:string, phone:string}} emp - Employee object without employeeId.
 * @returns {Promise<void>}
 */
async function addEmployeeRecord(emp) {
  let maxId = 0;

  const rawData = await fs.readFile(EMPLOYEES_FILE, "utf8");
  const employeeList = JSON.parse(rawData);

  for (let i = 0; i < employeeList.length; i++) {
    const eid = Number(employeeList[i].employeeId.slice(1));
    if (eid > maxId) {
      maxId = eid;
    }
  }

  emp.employeeId = "E" + String(maxId + 1).padStart(3, "0");
  employeeList.push(emp);

  await fs.writeFile(EMPLOYEES_FILE, JSON.stringify(employeeList, null, 4), "utf8");
}

/**
 * Get shift details for an employee (join assignments + shifts).
 * @param {string} empId - Employee ID.
 * @returns {Promise<Array<{shiftId:string, date:string, startTime:string, endTime:string}>>}
 */
async function getEmployeeShifts(empId) {
  // read assignments and collect shiftIds
  let rawData = await fs.readFile(ASSIGNMENTS_FILE, "utf8");
  const assignmentList = JSON.parse(rawData);

  const shiftIds = [];
  for (let i = 0; i < assignmentList.length; i++) {
    if (assignmentList[i].employeeId === empId) {
      shiftIds.push(assignmentList[i].shiftId);
    }
  }

  // read shifts and return details for collected ids
  rawData = await fs.readFile(SHIFTS_FILE, "utf8");
  const shiftList = JSON.parse(rawData);

  const shiftDetails = [];
  for (let i = 0; i < shiftList.length; i++) {
    if (shiftIds.includes(shiftList[i].shiftId)) {
      shiftDetails.push(shiftList[i]);
    }
  }

  return shiftDetails;
}
/**
 * Loads and returns the config object from config.json.
 * @returns {Promise<{maxDailyHours:number}>}
 */

async function getConfig() {
    const rawData = await fs.readFile(CONFIG_FILE, "utf8");
    return JSON.parse(rawData);
  }
  
  
  module.exports = {
    getAllEmployees,
    findEmployee,
    findShift,
    findAssignment,
    addAssignment,
    addEmployeeRecord,
    getEmployeeShifts,
    getConfig
  };
  
