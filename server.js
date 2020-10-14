var mysql = require("mysql");
var inquirer = require("inquirer");
var cTable = require("console.table");

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
            choices: ["View departments", "View roles", "View employees", "Add a department", "Add roles", "Add employees",
                "Update employee roles", "Delete departments", "Delete roles", "Delete employees"]
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
                case "Delete departments":
                    deleteDepartments();
                    break;
                case "Delete roles":
                    deleteRoles();
                    break;
                case "Delete employees":
                    deleteEmployees();
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
    var query = "SELECT * FROM department"
    connection.query(query, function (err, res) {
        if (err) throw err;
        inquirer.prompt([
            {
                name: "title",
                type: "input",
                message: "Enter the new Role's Title: "
            },
            {
                name: "salary",
                type: "input",
                message: "Enter the new Role's Salaray: "
            },
            {
                name: "department",
                type: "list",
                message: "Select a department for the new role",
                choices: function () {
                    var departmentArray = [];
                    for (i = 0; i < res.length; i++) {
                        departmentArray.push(res[i].department_name)
                    }
                    return departmentArray
                }
            }
        ]).then(function (answer) {
            var depID;
            var promise = new Promise(function (resolve, reject) {
                var query = "SELECT id FROM department WHERE department_name = ?"
                connection.query(query, [answer.department], function (err, res) {
                    if (err) throw err
                    depID = res[0].id
                    resolve()
                })
            })
            promise.then(function () {
                connection.query("INSERT INTO roles SET ? ",
                    {
                        title: answer.title,
                        salary: answer.salary,
                        department_id: depID
                    },
                    function (err, res) {
                        if (err) throw err
                        console.log(`Role successfully added`)
                        promptUser();;
                    })
            })
        })
    })
}

//function to add employees
const addEmployees = () => {
    var query = `SELECT * FROM employee INNER JOIN roles ON employee.role_id = roles.id INNER JOIN department ON roles.department_id = department.id`
    connection.query(query, function (err, res) {
            if (err) throw err;
            inquirer.prompt([
                {
                    name: "firstName",
                    type: "input",
                    message: "Enter the New employee first name: "
                },
                {
                    name: "lastName",
                    type: "input",
                    message: "Enter the New employee last name: "
                },
                {
                    name: "role",
                    type: "list",
                    message: "Select the employee's role:",
                    choices: function () {
                        var roleArray = [];
                        for (i = 0; i < res.length; i++) {
                            roleArray.push(res[i].title)
                        }
                        return [...new Set(roleArray)];
                    }
                },
                {
                    name: "manager",
                    type: "list",
                    message: "Who is this employee's manager?",
                    choices: function () {
                        var managerArray = [];
                        for (i = 0; i < res.length; i++) {
                            managerArray.push(res[i].first_name)
                        }
                        return managerArray
                    }
                }
            ]).then(function (answer) {
                var empID;
                var roleID
                var promise = new Promise(function (resolve, reject) {
                    connection.query("SELECT id FROM roles WHERE title = ?", [answer.role], function (err, res) {
                        if (err) console.log(err)
                        roleID = res[0].id
                        connection.query("SELECT id FROM employee WHERE first_name = ?", [answer.manager], function (err, res) {
                            if (err) console.log(err)
                            empID = res[0].id
                            resolve()
                        })
                    })
                })
                promise.then(function () {
                    var query = "INSERT INTO employee SET ? "
                    connection.query(query,
                        {
                            first_name: answer.firstName,
                            last_name: answer.lastName,
                            role_id: roleID,
                            manager_id: empID
                        }, function (err, res) {
                            if (err) return console.log(err)
                            console.log("Employee successfully added")
                            promptUser();;
                        })
                })
            })
        });
}

///Update Employee Role
const updateEmployeeRoles = () => {
    var query = `SELECT employee.first_name, employee.last_name, roles.title
                    FROM employee 
                    RIGHT JOIN roles ON employee.role_id = roles.id`;
    connection.query(query, function (err, res) {
      if (err) throw err;
      inquirer.prompt([
        {
          name: "emp",
          type: "list",
          message: "Select which employee's role you'd like to update:",
          choices: function () {
            var empArray = [];
            for (let i = 0; i < res.length; i++) {
              empArray.push(res[i].first_name + ' ' + res[i].last_name)
            }
            return empArray.filter((val) => val !== null)
          }
        },
        {
          name: "role",
          type: "list",
          message: "Select a new role for this employee:",
          choices: function () {
            var roleArray = [];
            for (let i = 0; i < res.length; i++) {
              roleArray.push(res[i].title)
            }
            return [...new Set(roleArray)]
          }
        }
      ]).then(function (answer) {
        var roleID
        var employeeToUpdate = answer.emp.substring(0, answer.emp.indexOf(' '))
        var promise = new Promise(function (resolve, reject) {
          connection.query("SELECT id FROM roles WHERE title = ?", [answer.role], function (err, res) {
            if (err) console.log(err)
            roleID = res[0].id
            resolve()
          })
        })
        promise.then(function () {
          connection.query("UPDATE employee SET ? WHERE ?",
            [
              {
                role_id: roleID
              },
              {
                first_name: employeeToUpdate
              }
            ], function (err, res) {
              if (err) throw err;
              console.log(`Role successfully updated`)
              promptUser();
            })
        })
      })
    })
  }

//function to delete employees
const deleteEmployees = () => {
    connection.query('SELECT * FROM employee', function (err, result) {
        if (err) throw err
        inquirer.prompt(
            {
                name: 'delete',
                type: 'list',
                message: 'Which employee would you like to delete?',
                choices: function () {
                    var choiceArray = []
                    for (i = 0; i < result.length; i++) {
                        choiceArray.push(result[i].first_name + ' ' + result[i].last_name)
                    }
                    return choiceArray
                }
            })
            .then(function (answer) {
                var employeeToUpdate = answer.delete.split(' ')
                connection.query(`DELETE FROM employee WHERE first_name = "${employeeToUpdate[0]}" AND last_name = "${employeeToUpdate[1]}"`, function (err) {
                    if (err) throw err
                })
            })
        promptUser();
    })
}

//function to delete roles
const deleteRoles = () => {
    connection.query('SELECT * FROM roles', function (err, result) {
        if (err) throw err
        inquirer.prompt(
            {
                name: 'delete',
                type: 'list',
                message: 'Which role would you like to delete?',
                choices: function () {
                    var choiceArray = []
                    for (i = 0; i < result.length; i++) {
                        choiceArray.push(result[i].title)
                    }
                    return choiceArray
                }
            })
            .then(function (answer) {
                var roleToUpdate = answer.delete
                connection.query(`DELETE FROM roles WHERE title = "${roleToUpdate}"`, function (err) {
                    if (err) throw err
                })
            })
        promptUser();
    })
}

//function to delete departments
const deleteDepartments = () => {
    connection.query('SELECT * FROM department', function (err, result) {
        if (err) throw err
        inquirer.prompt(
            {
                name: 'delete',
                type: 'list',
                message: 'Which department would you like to delete?',
                choices: function () {
                    var choiceArray = []
                    for (i = 0; i < result.length; i++) {
                        choiceArray.push(result[i].department_name)
                    }
                    return choiceArray
                }
            })
            .then(function (answer) {
                var departmentToUpdate = answer.delete
                connection.query(`DELETE FROM department WHERE department_name = "${departmentToUpdate}"`, function (err) {
                    if (err) throw err
                })
            })
        promptUser();
    })
}