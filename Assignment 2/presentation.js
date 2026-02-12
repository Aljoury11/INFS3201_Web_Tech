
"use strict";

const prompt = require("prompt-sync")();
const business = require("./business");

/**
 * Displays the employee list in a nicely formatted table.
 * @returns {Promise<void>}
 */
async function displayEmployees() {
  const employees = await business.listEmployees();

  console.log("Employee ID  Name                Phone");
  console.log("-----------  ------------------- ---------");

  for (let i = 0; i < employees.length; i++) {
    const emp = employees[i];
    console.log(emp.employeeId.padEnd(13) + emp.name.padEnd(20) + emp.phone);
  }
}

/**
 * UI function for adding a new employee.
 * @returns {Promise<void>}
 */
async function addNewEmployee() {
  const name = prompt("Enter employee name: ");
  const phone = prompt("Enter phone number: ");

  await business.addEmployee({ name: name, phone: phone });
  console.log("Employee added...");
}

/**
 * UI function for assigning an employee to a shift.
 * @returns {Promise<void>}
 */
async function scheduleEmployee() {
  const empId = prompt("Enter employee ID: ");
  const shiftId = prompt("Enter shift ID: ");

  const result = await business.assignShift(empId, shiftId);
  if (result === "Ok") {
    console.log("Shift Recorded");
  } else {
    console.log(result);
  }
}

/**
 * UI function to display an employee schedule in a CSV-like format.
 * @returns {Promise<void>}
 */
async function getEmployeeSchedule() {
  const empId = prompt("Enter employee ID: ");
  const details = await business.getScheduleForEmployee(empId);

  console.log("");
  console.log("date,start,end");
  for (let i = 0; i < details.length; i++) {
    const d = details[i];
    console.log(d.date + "," + d.startTime + "," + d.endTime);
  }
}

/**
 * Displays the menu and calls UI functions.
 * @returns {Promise<void>}
 */
async function displayMenu() {
  while (true) {
    console.log("1. Show all employees");
    console.log("2. Add new employee");
    console.log("3. Assign employee to shift");
    console.log("4. View employee schedule");
    console.log("5. Exit");

    const choice = Number(prompt("What is your choice> "));

    if (choice === 1) {
      await displayEmployees();
      console.log("\n\n");
    } else if (choice === 2) {
      await addNewEmployee();
      console.log("\n\n");
    } else if (choice === 3) {
      await scheduleEmployee();
      console.log("\n\n");
    } else if (choice === 4) {
      await getEmployeeSchedule();
      console.log("\n\n");
    } else if (choice === 5) {
      break;
    } else {
      console.log("Error in selection");
    }
  }

  console.log("*** Goodbye!");
}

displayMenu();

