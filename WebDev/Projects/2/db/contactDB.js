const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const db = new sqlite3.Database('./db/contact_list.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS Users (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    FirstName TEXT,
    LastName TEXT,
    Username TEXT UNIQUE,
    Password TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS Contacts (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    FirstName TEXT,
    LastName TEXT,
    PhoneNumber TEXT,
    EmailAddress TEXT,
    Street TEXT,
    City TEXT,
    State TEXT,
    Zip TEXT,
    Country TEXT,
    ContactByEmail INTEGER,
    ContactByPhone INTEGER
  )`);
});

// Function to create initial user if it doesn't exist
const createInitialUser = () => {
  const username = 'cmps369';
  const password = 'rcnj';
  db.get('SELECT * FROM Users WHERE Username = ?', [username], (err, row) => {
    if (!row) {
      const hashedPassword = bcrypt.hashSync(password, 10);
      db.run('INSERT INTO Users (FirstName, LastName, Username, Password) VALUES (?, ?, ?, ?)', 
        ['Default', 'User', username, hashedPassword]);
    }
  });
};

createInitialUser();

module.exports = db;
