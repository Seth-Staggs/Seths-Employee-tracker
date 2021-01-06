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
                addempRole();
                break;

            case "Add New Employee":
                addEmployee();
                break;

            case "View all Departments":
                viewDepartments();
                break;

            case "View all Employee Roles":
                viewempRoles();
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

// Function for adding departments.
function addDepartment() {
    inquirer.prompt([
        {
            type: "input",
            name: "department",
            message: "Add Department: "
        }
    ]).then(answers => {

        connection.query(
            "INSERT INTO department SET ?",
            {
                department_name: answers.department,
            },
            function (err) {
                if (err) throw err;
                console.log("New Department added successfully");
                start();
            }
        );
    });
};

// Function for adding roles
function addempRole() {
    let dptName = []
    promisemysql.createConnection(conProp).then((dbconnection) => {
        return Promise.all([
            dbconnection.query("SELECT * FROM department"),
        ]);

    }).then(([department]) => {
        for (var i = 0; i < department.length; i++) {
            dptName.push(department[i].department_name);
        }

        return Promise.all([department]);

    }).then(([department]) => {

        inquirer.prompt([
            {
                type: "input",
                name: "role",
                message: "Add Employee Role: ",
                validate: function (input) {
                    if (input === "") {
                        console.log("Employee Role Required");
                        return false;
                    }
                    else {
                        return true;
                    }
                }
            },
            {
                type: "input",
                name: "salary",
                message: "Employee Role Salary: ",
                validate: function (value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return false;
                }
            },
            {
                type: "list",
                name: "department",
                message: "Department for this Role: ",
                choices: dptName
            }

        ]).then(answers => {

            let dptID;

            for (var i = 0; i < department.length; i++) {
                if (answers.department == department[i].department_name) {
                    dptID = department[i].id;
                }
            }

            connection.query(
                "INSERT INTO emp_role SET ?",
                {
                    title: answers.role,
                    salary: answers.salary,
                    department_id: dptID
                },
                function (err) {
                    if (err) throw err;
                    console.log("Employee Role added successfully");
                    start();
                }
            );
        })
    })
};

// Function for adding employees
function addEmployee() {
    let empRole = [];
    let employees = [];

    promisemysql.createConnection(conProp).then((dbconnection) => {
        return Promise.all([
            dbconnection.query("SELECT * FROM employee_role"),
            dbconnection.query("SELECT employee.id, concat(employee.first_name, ' ' ,  employee.last_name) AS fullName FROM employee ORDER BY fullName ASC")
        ]);

    }).then(([role, name]) => {
        for (var i = 0; i < role.length; i++) {
            empRole.push(role[i].title);
        }
        for (var i = 0; i < name.length; i++) {
            employees.push(name[i].fullName)
        }

        return Promise.all([role, name]);

    }).then(([role, name]) => {
        employees.push('null')

        inquirer.prompt([
            {
                type: "input",
                name: "firstname",
                message: "First Name: ",
                validate: function (input) {
                    if (input === "") {
                        console.log("First Name Required");
                        return false;
                    }
                    else {
                        return true;
                    }
                }
            },
            {
                type: "input",
                name: "lastname",
                message: "Last Name: ",
                validate: function (input) {
                    if (input === "") {
                        console.log("Last Name Required");
                        return false;
                    }
                    else {
                        return true;
                    }
                }
            },
            {
                type: "list",
                name: "currentRole",
                message: "Role within the company: ",
                choices: empRole
            },
            {
                type: "list",
                name: "manager",
                message: "Name of their manager: ",
                choices: employees
            }
        ]).then(answers => {
            let roleID;
            let managerID = null;

            for (var i = 0; i < role.length; i++) {
                if (answers.currentRole == role[i].title) {
                    roleID = role[i].id;
                }
            }

            for (var i = 0; i < name.length; i++) {
                if (answers.manager == name[i].fullName) {
                    managerID = name[i].id;
                }
            }


            connection.query(
                "INSERT INTO employee SET ?",
                {
                    first_name: answers.firstname,
                    last_name: answers.lastname,
                    role_id: roleID,
                    manager_id: managerID
                },
                function (err) {
                    if (err) throw err;
                    console.log("Employee added successfully");
                    start();
                }
            );
        });
    })
};

// Function for viewing departments.
function viewDepartments() {
    connection.query("SELECT department.id, department.department_name, SUM(emp_role.salary) AS utilized_budget FROM employee LEFT JOIN emp_role on emp.role_id = emp_role.id LEFT JOIN department on emp_role.department_id = department.id GROUP BY department.id, department.department_name;", function (err, results) {
        if (err) throw err;
        console.table(results);
        start();
    });
};

// Function for viewing roles.
function viewempRoles() {
    connection.query("SELECT emp_role.id, emp_role.title, department.department_name AS department, emp_role.salary FROM emp_role LEFT JOIN department on emp_role.department_id = department.id;", function (err, results) {
        if (err) throw err;
        console.table(results);
        start();
    });
};

// Function for viewing employees.
function viewEmployees() {
    connection.query("SELECT employee.id, employee.first_name, employee.last_name, emp_role.title, emp_role.salary FROM employeetracker_db.employee LEFT JOIN emp_role on emp_role.id = employee.role_id", function (err, results) {
        if (err) throw err;
        console.table(results);
        start();
    });
};

function changerole() {

    let empRole = [];
    let employees = [];

    promisemysql.createConnection(conProp).then((dbconnection) => {
        return Promise.all([
            dbconnection.query("SELECT * FROM emp_role"),
            dbconnection.query("SELECT employee.id, concat(employee.first_name, ' ' ,  employee.last_name) AS fullName FROM employee ORDER BY fullName ASC")

        ]);
    }).then(([role, name]) => {

        // Push queried employee roles into the array empRole
        for (var i = 0; i < role.length; i++) {
            empRole.push(role[i].title);
        }
        // Push queried employee names into the array employees
        for (var i = 0; i < name.length; i++) {
            employees.push(name[i].fullName)
        }

        return Promise.all([role, name]);

    }).then(([role, name]) => {

        inquirer.prompt([
            {
                type: "list",
                name: "employeeName",
                message: "Employee Name: ",
                choices: employees
            },
            {
                type: "list",
                name: "currentRole",
                message: "New Role: ",
                choices: empRole
            }
        ]).then(answers => {

            let roleID;
            let empID;

            for (var i = 0; i < role.length; i++) {
                if (answers.currentRole == role[i].title) {
                    roleID = role[i].id;
                }
            }

            for (var i = 0; i < name.length; i++) {
                if (answers.employeeName == name[i].fullName) {
                    empID = name[i].id;
                }
            }

            connection.query(
                `UPDATE employee SET role_id = ${roleID} WHERE id = ${empID}`,
                function (err) {
                    if (err) throw err;
                    console.log("Employee role changed successfully");
                    start();
                }
            );
        });
    })
};