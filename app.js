"use strict";

const express = require("express");
const path = require("path");
const hbs = require("express-handlebars");
const service = require("./business");

const app = express();

app.engine(
  "hbs",
  hbs.engine({
    extname: "hbs",
    defaultLayout: false
  })
);

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

/**
 * GET /
 * Home page: show employees list.
 */
app.get("/", async function (req, res) {
  const list = await service.listEmployees();
  res.render("home", { employees: list });
});

/**
 * GET /employees/:id
 * Details page: employee info + sorted shifts.
 */
app.get("/employees/:id", async function (req, res) {
  const employeeId = req.params.id;

  const emp = await service.getEmployee(employeeId);
  if (emp === undefined || emp === null) {
    res.status(404).send("Employee not found");
    return;
  }

  const shifts = await service.getScheduleForEmployeeSorted(employeeId);

  // Mark morning shifts (startTime < 12:00) for template highlighting
  let i = 0;
  while (i < shifts.length) {
    const start = String(shifts[i].startTime);
    shifts[i].isMorning = start < "12:00";
    i++;
  }

  res.render("employee", { employee: emp, shifts: shifts });
});

/**
 * GET /employees/:id/edit
 * Show edit form (pre-filled).
 */
app.get("/employees/:id/edit", async function (req, res) {
  const employeeId = req.params.id;

  const emp = await service.getEmployee(employeeId);
  if (!emp) {
    res.status(404).send("Employee not found");
    return;
  }

  res.render("editEmployee", { employee: emp });
});

/**
 * POST /employees/:id/edit
 * Validate + update, then redirect (PRG).
 */
app.post("/employees/:id/edit", async function (req, res) {
  const employeeId = req.params.id;

  let nameValue = req.body.name;
  let phoneValue = req.body.phone;

  if (typeof nameValue !== "string") {
    nameValue = "";
  }
  if (typeof phoneValue !== "string") {
    phoneValue = "";
  }

  nameValue = nameValue.trim();
  phoneValue = phoneValue.trim();

  if (nameValue.length === 0) {
    res.send("Validation failed: Name must be non-empty");
    return;
  }

  const phonePattern = /^[0-9]{4}-[0-9]{4}$/;
  if (!phonePattern.test(phoneValue)) {
    res.send("Validation failed: Phone must be 4 digits, a dash, then 4 digits");
    return;
  }

  await service.updateEmployee(employeeId, nameValue, phoneValue);

  res.redirect("/");
});

app.listen(3000, function () {
  console.log("Server running on http://localhost:3000");
});