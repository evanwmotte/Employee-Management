var mysql = require("mysql");
var inquirer = require("inquirer");
var cTable = require("console.table")

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "Hol@senior2556",
    database: "employees_db"
});

connection.connect(function (err) {
    if (err) throw err;
    promptUser();
});

const promptUser = () => {
    inquirer.prompt(
        {
            name: "add",
            type: "list",
            message: "Select an option:",
            choices: ["View departments", "View roles", "View employees", "View employees by manager", "Add a department", "Add roles", "Add employees",
                "Update employee roles", "Update employee managers", "Delete departments", "Delete roles", "Delete employees", "View budget usage by department"]
        })
        .then(function (answer) {
            switch (answer.add) {
                case "View departments":
                    viewDepartments();
                    break;
                case "View roles":
                    viewRoles();
                    break;
                case "View employees":
                    viewEmployees();
                    break;
                case "View employees by manager":
                    viewEmployeesByManager();
                    break;
                case "Add a department":
                    addDepartment();
                    break;
                case "Add roles":
                    addRoles();
                    break;
                case "Add employees":
                    addEmployees();
                    break;
                case "Update employee roles":
                    updateEmployeeRoles();
                    break;
                case "Update employee managers":
                    updateEmployeeManagers();
                    break;
                case "Delete departments":
                    deleteDepartments();
                    break;
                case "Delete Roles":
                    deleteRoles();
                    break;
                case "Delete employees":
                    deleteEmployees();
                    break;
                case "View budget usage by department":
                    viewBudgetUsage();
                    break;
                case "Exit":
                    connection.end();
                    break;
            }
        })
}

//function to view departments
const viewDepartments = () => {
    connection.query("SELECT * FROM department", function (err, res) {
        if (err) throw err;
        var departmentsArray = [];
        res.forEach(department => departmentsArray.push(department))
        console.log(cTable.getTable(departmentsArray))
        promptUser();
    })
};

//function to view roles
const viewRoles = () => {
    connection.query("SELECT * FROM roles", function (err, res) {
        if (err) throw err;
        var rolesArray = [];
        res.forEach(role => rolesArray.push(role))
        console.log(cTable.getTable(rolesArray))
        promptUser();
    })
};

//function to view employees
const viewEmployees = () => {
    connection.query("SELECT first_name, last_name FROM employee", function (err, res) {
        if (err) throw err;
        var employeesArray = [];
        res.forEach(employee => employeesArray.push(employee))
        console.log(cTable.getTable(employeesArray))
        promptUser();
    })
};

//function to view employees by manager
// const viewEmployeesByManager = () => {
//     connection.query("SELECT first_name, last_name FROM employee WHERE ?", {}, function (err, res) {
//         if (err) throw err;
//         var employeesArray = [];
//         res.forEach(employee => employeesArray.push(employee))
//         console.log(cTable.getTable(employeesArray))
//     })
// };

//function to add department
const addDepartment = () => {
    inquirer.prompt(
        {
            name: "departmentName",
            type: "input",
            message: "What is the new department's name?"
        })
        .then(function (answer) {
            connection.query("INSERT INTO department SET ?", { department_name: answer.departmentName }, function (err) {
                if (err) throw err;
                console.log("Department added successfully");
                promptUser();
            })
        })
};

//function to add roles
const addRoles = () => {
    inquirer
        .prompt([
            {
                name: "role_title",
                type: "input",
                message: "What is the title of the role?"
            },
            {
                name: "role_salary",
                type: "input",
                message: "What is the salary of this role?"
            },
            {
                name: "role_dept_id",
                type: "input",
                message: "What is the department ID for this role?"
            }])
        .then(function (answer) {
            var query = "INSERT INTO role SET ?";
            connection.query(query, { title: answer.role_title, salary: answer.role_salary, department_id: answer.role_dept_id }, function (err, res) {
                if (err) {
                    return console.error(err.message)
                }
                console.log("Added Role... Title: " + answer.role_title + "|| Salary: " + answer.role_salary + "|| Dept ID: " + answer.role_dept_id);
                runSearch();
            });
        });
}

//function to add employees
const addEmployees = () => {
    inquirer
        .prompt([
            {
                name: "first_name",
                type: "input",
                message: "What is the employee's first name?"
            },
            {
                name: "last_name",
                type: "input",
                message: "What is the employee's last name?"
            },
            {
                name: "role",
                type: "input",
                message: "What is the employee's role id?"
            },
            {
                name: "manager",
                type: "input",
                message: "Who will be this employee's manager?"
            }])
        .then(function (answer) {
            var query = "INSERT INTO employee SET ?";
            connection.query(query, { first_name: answer.first_name, last_name: answer.last_name, role_id: answer.role_id, manager_id: answer.mgr_id }, function (err, res) {
                if (err) {
                    return console.error(err.message)
                }
                console.log("Employee successfully added");
                promptUser();
            });
        });
}

//function to update employee roles
const updateEmployeeRoles = async () => {
    inquirer
        .prompt([
            {
                name: "employee_select",
                type: "input",
                message: "What is the ID of the Employee who's role will be updated?"
            },
            {
                name: "role_new",
                type: "input",
                message: "What should their new role be set to?"
            }])
        .then(function (answer) {
            var query = "UPDATE employee SET role_id = ? WHERE id = ?";
            connection.query(query, [answer.role_new, answer.employee_select], function (err, res) {
                    console.log("ID: " + res[i].id + "|| First Name " + res[i].first_name + "|| Last Name: " + res[i].last_name + "|| Role ID: " + res[i].role_id + "|| Manager ID: " + res[i].manager_id);

            })
            runSearch();
        });

}