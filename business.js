"use strict";

const dataLayer = require("./persistence");

/**
 * Return the full list of employees.
 */
async function listEmployees() {
  const result = await dataLayer.getAllEmployees();
  return result;
}

/**
 * Return a single employee using the MongoDB _id.
 * @param {string} employeeId
 */
async function getEmployee(employeeId) {
  const emp = await dataLayer.findEmployee(employeeId);
  return emp;
}

/**
 * Return employee shifts (not sorted).
 * @param {string} employeeId
 */
async function getScheduleForEmployee(employeeId) {
  const shifts = await dataLayer.getEmployeeShifts(employeeId);
  return shifts;
}

/**
 * Return employee shifts sorted by:
 *   1) date ascending
 *   2) startTime ascending
 *
 * Uses simple bubble sort (student style).
 *
 * @param {string} employeeId
 */
async function getScheduleForEmployeeSorted(employeeId) {
  const shiftList = await dataLayer.getEmployeeShifts(employeeId);

  let i;
  let j;

  for (i = 0; i < shiftList.length; i++) {
    for (j = 0; j < shiftList.length - 1; j++) {
      const first = shiftList[j];
      const second = shiftList[j + 1];

      const firstKey = first.date + " " + first.startTime;
      const secondKey = second.date + " " + second.startTime;

      if (firstKey > secondKey) {
        const temp = shiftList[j];
        shiftList[j] = shiftList[j + 1];
        shiftList[j + 1] = temp;
      }
    }
  }

  return shiftList;
}

/**
 * Update employee information.
 * @param {string} employeeId
 * @param {string} name
 * @param {string} phone
 */
async function updateEmployee(employeeId, name, phone) {
  await dataLayer.updateEmployee(employeeId, name, phone);
}

module.exports = {
  listEmployees,
  getEmployee,
  getScheduleForEmployee,
  getScheduleForEmployeeSorted,
  updateEmployee
};