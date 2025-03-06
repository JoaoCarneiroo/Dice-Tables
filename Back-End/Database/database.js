const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./Database/cafe.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) console.error(err.message);
    console.log('Conectado ao banco de dados SQLite.');
});

module.exports = db;
