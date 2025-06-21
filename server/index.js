const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const app = express();

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) return console.error(err.message);
  console.log('Connected to SQLite database.');
});

// Initialize all necessary tables
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT,
      timeIn TEXT,
      timeOut TEXT,
      totalHours REAL,
      comment TEXT,
      foremanId INTEGER,
      propertyName TEXT,
      FOREIGN KEY(foremanId) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS entry_employee_times (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entryId INTEGER NOT NULL,
      employeeId INTEGER NOT NULL,
      timeIn TEXT,
      timeOut TEXT,
      FOREIGN KEY(entryId) REFERENCES entries(id),
      FOREIGN KEY(employeeId) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS entry_employee_hours (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entryId INTEGER NOT NULL,
      employeeId INTEGER NOT NULL,
      category TEXT NOT NULL,
      hours REAL DEFAULT 0,
      FOREIGN KEY(entryId) REFERENCES entries(id),
      FOREIGN KEY(employeeId) REFERENCES users(id)
    )
  `);

  db.run(`
    INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)
  `, ['admin', 'admin123'], (err) => {
    if (err) console.error('Error inserting test user:', err.message);
    else console.log('Test user ensured: admin / admin123');
  });
});

// Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  db.get(`SELECT * FROM users WHERE username = ? AND password = ?`, [username, password], (err, row) => {
    if (err) return res.status(500).json({ success: false, error: 'DB error' });
    if (row) res.json({ success: true, user: { id: row.id, username: row.username } });
    else res.json({ success: false, error: 'Invalid credentials' });
  });
});

// Create Entry
app.post('/api/entries', (req, res) => {
  const { date, timeIn, timeOut, totalHours, comment, foremanId, propertyName, employeeTimes, hoursData } = req.body;

  db.run(
    `INSERT INTO entries (date, timeIn, timeOut, totalHours, comment, foremanId, propertyName)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [date, timeIn, timeOut, totalHours, comment, foremanId, propertyName],
    function (err) {
      if (err) return res.status(500).json({ success: false, error: 'Insert entry failed' });

      const entryId = this.lastID;

      const insertEmployeeTime = db.prepare(`
        INSERT INTO entry_employee_times (entryId, employeeId, timeIn, timeOut) VALUES (?, ?, ?, ?)
      `);
      for (const empId in employeeTimes) {
        const times = employeeTimes[empId];
        insertEmployeeTime.run(entryId, empId, times.timeIn, times.timeOut);
      }
      insertEmployeeTime.finalize();

      const insertEmployeeHours = db.prepare(`
        INSERT INTO entry_employee_hours (entryId, employeeId, category, hours) VALUES (?, ?, ?, ?)
      `);
      for (const empId in hoursData) {
        const categories = hoursData[empId];
        for (const category in categories) {
          insertEmployeeHours.run(entryId, empId, category, categories[category]);
        }
      }
      insertEmployeeHours.finalize();

      res.json({ success: true, entryId });
    }
  );
});


// Get latest entries
app.get('/api/entries/latest', (req, res) => {
  console.log("GET /api/entries/latest called");
  db.all(`SELECT * FROM entries ORDER BY id DESC LIMIT 15`, [], (err, rows) => {
    if (err) {
      console.error('Fetch error:', err.message);
      return res.status(500).json({ success: false, error: 'Failed to load entries' });
    }

    console.log(`Fetched ${rows.length} entries`);
    if (!rows || rows.length === 0) {
      return res.json([]);
    }

    res.json(rows);
  });
});


// Get single entry
app.get('/api/entries/:id', (req, res) => {
  const entryId = req.params.id;

  db.get(`SELECT * FROM entries WHERE id = ?`, [entryId], (err, entry) => {
    if (err || !entry) return res.status(404).json({ success: false, error: 'Entry not found' });

    db.all(`SELECT employeeId, timeIn, timeOut FROM entry_employee_times WHERE entryId = ?`, [entryId], (err, employeeTimes) => {
      if (err) return res.status(500).json({ success: false, error: 'Failed to fetch employee times' });

      const employeeTimesObj = {};
      employeeTimes.forEach((et) => {
        employeeTimesObj[et.employeeId] = { timeIn: et.timeIn, timeOut: et.timeOut };
      });

      db.all(`SELECT employeeId, category, hours FROM entry_employee_hours WHERE entryId = ?`, [entryId], (err, employeeHours) => {
        if (err) return res.status(500).json({ success: false, error: 'Failed to fetch employee hours' });

        const hoursDataObj = {};
        employeeHours.forEach(({ employeeId, category, hours }) => {
          if (!hoursDataObj[employeeId]) hoursDataObj[employeeId] = {};
          hoursDataObj[employeeId][category] = hours;
        });

        res.json({ ...entry, employeeTimes: employeeTimesObj, hoursData: hoursDataObj });
      });
    });
  });
});




const PORT = 5000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
