var mysql = require("mysql"); // connects to mysql
var inquirer = require("inquirer"); // interacts with user through cmd line
var promisemysql = require("promise-mysql"); // Asyncronous 
require("console.table");

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

//Function to add roles
function addEmployeeRole() {
    let dptName = []
   promisemysql.createConnection(conProp)
   .then((dbconnection) => {
       return Promise.all([
            dbconnection.query("SELECT * FROM department"),
       ]);

   })
   .then(([department]) => {
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
                    validate: function(input){
                        if (input === ""){
                            console.log("Employee Role Required");
                            return false;
                        }
                        else{
                            return true;
                        }
                    }
                },
                {
                    type: "input",
                    name: "salary",
                    message: "Employee Role Salary: ",
                    validate: function(value) {
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
                
            ]).then(answers=>{

                let dptID;

                for (var i = 0; i < department.length; i++) {
                    if (answers.department == department[i].department_name) {
                        dptID = department[i].id;
                    }
                } 
                
                connection.query(
                    "INSERT INTO employee_role SET ?",
                    {
                    title: answers.role,
                    salary: answers.salary,
                    department_id: dptID
                    },
                    function(err) {
                    if (err) throw err;
                    console.log("Employee Role added successfully"); 
                    start();
                    }
                );
            })
        })  
    
};