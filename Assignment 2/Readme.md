Course: INFS3201 – Web Technologies II
Assignment: Assignment 2
# Employee Scheduling System – INFS3201 Assignment 2

##  Overview
This project is a refactored version of the Employee Scheduling System developed for INFS3201 – Web Technologies II.  
The application allows users to manage employees, assign shifts, and enforce scheduling constraints.

The system follows a **3-tier architecture** to ensure proper separation of concerns:

- Presentation Layer
- Business Logic Layer
- Persistence Layer

---

##  Architecture

### Presentation Layer
Handles all console interactions with the user such as menus, prompts, and formatted outputs.

### Business Logic Layer
Processes business rules including employee scheduling validation and shift duration calculations.

### Persistence Layer
Manages file storage and retrieval using JSON files and implements CRUD operations.

---

##  Features

- Employee management  
- Shift assignment  
- Maximum daily hours validation using `config.json`  
- Shift duration calculation  
- Layered architecture implementation  
- JSDoc documented functions  

---

##  Technologies Used

- Node.js (CommonJS modules)
- JavaScript
- JSON for data storage
- GitHub for version control

---

## How to Run the Project

1. Install Node.js  
2. Navigate to the project folder  
3. Install dependencies (if applicable):

