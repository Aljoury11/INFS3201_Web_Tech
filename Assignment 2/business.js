"use strict";

const persistence = require("./persistence");

/**
 * Returns all employees (passthrough).
 * Presentation must call business, not persistence directly.
 * @returns {Promise<Array<{ employeeId: string, name: string, phone: string }>>}
 */
async function listEmployees() {
  return await persistence.getAllEmployees();
}

/**
 * Adds a new employee record (passthrough).
 * @param {{name:string, phone:string}} emp - Employee object without employeeId.
 * @returns {Promise<void>}
 */
async function addEmployee(emp) {
  await persistence.addEmployeeRecord(emp);
}

/**
 * Returns the shift details scheduled for an employee (passthrough).
 * @param {string} empId - Employee ID.
 * @returns {Promise<Array<{shiftId:string, date:string, startTime:string, endTime:string}>>}
 */
async function getScheduleForEmployee(empId) {
  return await persistence.getEmployeeShifts(empId);
}

/**
 * Attempts to assign a shift to an employee.
 * Checks that employee exists, shift exists, and assignment does not already exist.
 * Enforces maxDailyHours from config.json for the shift date.
 *
 * @param {string} empId - Employee ID.
 * @param {string} shiftId - Shift ID.
 * @returns {Promise<string>} "Ok" if success, otherwise an error message.
 */

async function assignShift(empId, shiftId) {
    const employee = await persistence.findEmployee(empId);
    if (!employee) {
      return "Employee does not exist";
    }
  
    const shift = await persistence.findShift(shiftId);
    if (!shift) {
      return "Shift does not exist";
    }
  
    const assignment = await persistence.findAssignment(empId, shiftId);
    if (assignment) {
      return "Employee already assigned to shift";
    }
  
    // Load maxDailyHours
    const config = await persistence.getConfig();
    const maxDailyHours = Number(config.maxDailyHours);
  
    if (!Number.isFinite(maxDailyHours) || maxDailyHours <= 0) {
      return "Invalid config: maxDailyHours must be a positive number";
    }
  
    // Hours for the new shift
    const newShiftHours = computeShiftDuration(shift.startTime, shift.endTime);
    if (!Number.isFinite(newShiftHours) || newShiftHours <= 0) {
      return "Invalid shift time format";
    }
  
    // Compute already scheduled hours for this employee on this date
    const scheduled = await persistence.getEmployeeShifts(empId);
    let totalHours = 0;
  
    for (let i = 0; i < scheduled.length; i++) {
      if (scheduled[i].date === shift.date) {
        totalHours += computeShiftDuration(scheduled[i].startTime, scheduled[i].endTime);
      }
    }
  
    if (totalHours + newShiftHours > maxDailyHours) {
      return "Cannot assign shift: maxDailyHours limit would be exceeded.";
    }
  
    await persistence.addAssignment(empId, shiftId);
    return "Ok";
  }
  
/**
 * Computes the duration of a shift in hours (decimal) given start and end times.
 * Times must be in "HH:MM" 24-hour format.
 *
 * @param {string} startTime - Start time in "HH:MM".
 * @param {string} endTime - End time in "HH:MM".
 * @returns {number} Duration in hours (decimal). Returns NaN for invalid inputs.
 */
function computeShiftDuration(startTime, endTime) {
    if (typeof startTime !== "string" || typeof endTime !== "string") {
      return NaN;
    }
    if (startTime.length !== 5 || endTime.length !== 5) {
      return NaN;
    }
    if (startTime[2] !== ":" || endTime[2] !== ":") {
      return NaN;
    }
  
    const sh = Number(startTime.slice(0, 2));
    const sm = Number(startTime.slice(3, 5));
    const eh = Number(endTime.slice(0, 2));
    const em = Number(endTime.slice(3, 5));
  
    if (!Number.isInteger(sh) || !Number.isInteger(sm) || !Number.isInteger(eh) || !Number.isInteger(em)) {
      return NaN;
    }
    if (sh < 0 || sh > 23 || eh < 0 || eh > 23 || sm < 0 || sm > 59 || em < 0 || em > 59) {
      return NaN;
    }
  
    const startMinutes = sh * 60 + sm;
    let endMinutes = eh * 60 + em;
  
    if (endMinutes < startMinutes) {
      endMinutes += 24 * 60; // overnight
    }
  
    return (endMinutes - startMinutes) / 60;
  }
  
  module.exports = {
    listEmployees,
    addEmployee,
    getScheduleForEmployee,
    assignShift,
    computeShiftDuration
  };
  