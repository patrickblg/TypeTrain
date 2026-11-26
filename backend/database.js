
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'typing.db');
const sqlPath = path.join(__dirname, 'db_content.sql');

const INIT = false

const database = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error when opening database:', err.message);
    } else {
        console.log('Database successfully opened!');

        if (INIT) {
            // Read and execute SQL file
            const initStatements = fs.readFileSync(sqlPath, 'utf8');
            database.exec(initStatements, (err) => {
                if (err) {
                    console.error('Error when initializing database:', err.message);
                } else {
                    console.log('Database successfully initialized!');
                }
            });

        }
    }
});

module.exports = database;
