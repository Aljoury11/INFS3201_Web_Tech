"use strict";

const input = require("prompt-sync")();
const service = require("./business");

/**
 * Display employees in table format.
 * @returns {Promise<void>}
 */
async function displayEmployees() {
  const list = await service.listEmployees();

  console.log("Employee ID  Name                Phone");
  console.log("-----------  ------------------- ---------");

  let i = 0;
  while (i < list.length) {
    const e = list[i];

    const line =
      e.employeeId.padEnd(13) +
      e.name.padEnd(20) +
      e.phone;

    console.log(line);
    i++;
  }
}

/**
 * UI to create a new employee.
 * @returns {Promise<void>}
 */
async function addEmployeeUI() {
  const empName = input("Enter employee name: ");
  const empPhone = input("Enter phone number: ");

  // NOTE: assumes business.addEmployee exists
  await service.addEmployee({
    name: empName,
    phone: empPhone,
  });

  console.log("Employee added...");
}

/**
 * Show schedule of an employee in CSV style.
 * @returns {Promise<void>}
 */
async function showEmployeeSchedule() {
  const employeeId = input("Enter employee ID: ");
  const schedule = await service.getScheduleForEmployee(employeeId);

  console.log("");
  console.log("date,start,end");

  for (let k = 0; k < schedule.length; k++) {
    const item = schedule[k];
    console.log(item.date + "," + item.startTime + "," + item.endTime);
  }
}

/**
 * Main menu loop.
 * @returns {Promise<void>}
 */
async function startMenu() {
  let running = true;

  while (running) {
    console.log("1. Show all employees");
    console.log("2. Add new employee");
    console.log("3. View employee schedule");
    console.log("4. Exit");

    const userChoice = Number(input("What is your choice> "));

    if (userChoice === 1) {
      await displayEmployees();
      console.log("\n\n");
    } else if (userChoice === 2) {
      await addEmployeeUI();
      console.log("\n\n");
    } else if (userChoice === 3) {
      await showEmployeeSchedule();
      console.log("\n\n");
    } else if (userChoice === 4) {
      running = false;
    } else {
      console.log("Error");
    }
  }

  console.log("Goodbye");
}

startMenu();