const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./cafe.db');

//Retrieving All Rows
db.all("SELECT EmployeeId, FirstName FROM employees", (error, rows) => {
    rows.forEach((row) => {
        console.log(row.EmployeeId + " " + row.FirstName);
    })
});