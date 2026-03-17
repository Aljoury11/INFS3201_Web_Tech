"use strict";

const express = require("express");
const path = require("path");
const hbs = require("express-handlebars");
const crypto = require("crypto");
const { MongoClient } = require("mongodb");

const service = require("./business");
const config = require("./config.json");

const app = express();

const SESSION_LENGTH = 5 * 60 * 1000;
const sessions = {};

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
 * Create a new session id
 * @returns {string}
 */
function createSessionId() {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Read cookies from request header
 * @param {any} req
 * @returns {Object}
 */
function readCookies(req) {
  const result = {};
  const cookieHeader = req.headers.cookie;

  if (!cookieHeader) {
    return result;
  }

  const parts = cookieHeader.split(";");
  let i = 0;

  while (i < parts.length) {
    const onePart = parts[i].trim();
    const equalIndex = onePart.indexOf("=");

    if (equalIndex > 0) {
      const key = onePart.substring(0, equalIndex);
      const value = onePart.substring(equalIndex + 1);
      result[key] = value;
    }

    i++;
  }

  return result;
}

/**
 * Protect routes using session cookie
 */
function authMiddleware(req, res, next) {
  if (req.path === "/login" || req.path === "/logout") {
    next();
    return;
  }

  const cookies = readCookies(req);
  const sessionId = cookies.sessionId;

  if (!sessionId || !sessions[sessionId]) {
    res.render("login", { message: "Please login first" });
    return;
  }

  const session = sessions[sessionId];

  if (Date.now() > session.expiresAt) {
    delete sessions[sessionId];
    res.clearCookie("sessionId");
    res.render("login", { message: "Session expired. Please login again" });
    return;
  }

  session.expiresAt = Date.now() + SESSION_LENGTH;

  res.cookie("sessionId", sessionId, {
    httpOnly: true,
    expires: new Date(Date.now() + SESSION_LENGTH)
  });

  req.username = session.username;

  next();
}

app.use(authMiddleware);

/**
 * GET /login
 * Show login page
 */
app.get("/login", function (req, res) {
  res.render("login", { message: "" });
});

/**
 * POST /login
 * Validate username and password
 */
app.post("/login", async function (req, res) {
  let usernameValue = req.body.username;
  let passwordValue = req.body.password;

  if (typeof usernameValue !== "string" || typeof passwordValue !== "string") {
    res.render("login", { message: "Invalid login" });
    return;
  }

  usernameValue = usernameValue.trim();

  const hash = crypto
    .createHash("sha256")
    .update(passwordValue)
    .digest("hex");

  const client = new MongoClient(config.mongoUri);

  await client.connect();
  const db = client.db("infs3201_winter2026");

  const user = await db.collection("users").findOne({
    username: usernameValue,
    password: hash
  });

  await client.close();

  if (!user) {
    res.render("login", { message: "Invalid username or password" });
    return;
  }

  const sessionId = createSessionId();

  sessions[sessionId] = {
    username: usernameValue,
    expiresAt: Date.now() + SESSION_LENGTH
  };

  res.cookie("sessionId", sessionId, {
    httpOnly: true,
    expires: new Date(Date.now() + SESSION_LENGTH)
  });

  res.redirect("/");
});

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