var mysql = require("mysql"); // connects to mysql
var inquirer = require("inquirer"); // interacts with user through cmd line
var promisemysql = require("promise-mysql"); // Asyncronous 



var conProp = {
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "employeetracker_db"
};

var connection = mysql.createConnection(conProp);

connection.connect(function (err) {
    if (err) throw err;
    start();
});

//inquirer prompts
function start() {
    inquirer.prompt([
        {
            type: "list",
            name: "startOptions",
            message: "What would you like to do?",
            choices: [
                "Add New Department",
                "Add New Employee Role",
                "Add New Employee",
                "View all Departments",
                "View all Employee Roles",
                "View all Employees",
                "Change an Employee's role",
                "Exit program"
            ]
        }
    ]).then(answers => {
        switch (answers.startOptions) {

            case "Add New Department":
                addDepartment();
                break;

            case "Add New Employee Role":
                addEmployeeRole();
                break;

            case "Add New Employee":
                addEmployee();
                break;

            case "View all Departments":
                viewDepartments();
                break;

            case "View all Employee Roles":
                viewEmployeeRoles();
                break;

            case "View all Employees":
                viewEmployees();
                break;

            case "Change an Employee's role":
                changerole();
                break;

            default:
                console.log("Goodbye");
                process.exit();
        };
    });
};

//Function for adding departments.
function addDepartment() {
    inquirer.prompt([
        {
            type: "input",
            name: "department",
            message: "Add Department: "
        }
    ]).then(answers=> {
        
        connection.query(
            "INSERT INTO department SET ?",
            {
              department_name: answers.department,
            },
            function(err) {
              if (err) throw err;
              console.log("New Department added successfully");
              start();
            }
          );
    }); 
};