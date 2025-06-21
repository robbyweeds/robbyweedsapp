const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const app = express();

app.use(cors());
app.use(express.json());

// Open (or create) SQLite DB file
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) return console.error(err.message);
  console.log('Connected to SQLite database.');
});

// Create users table if not exists
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )
`);

// Create entries table with new columns foremanId and propertyName
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

// Create new tables for employee times and hours
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

// Insert test user admin/admin123 if not exists
db.run(`INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)`, ['admin', 'admin123'], (err) => {
  if (err) {
    console.error('Error inserting test user:', err.message);
  } else {
    console.log('Test user created: admin / admin123');
  }
});

// POST new entry (create)
app.post('/api/entries', (req, res) => {
  const {
    date,
    timeIn,
    timeOut,
    totalHours,
    comment,
    foremanId,
    propertyName,
    employeeTimes,
    hoursData,
  } = req.body;

  // Insert into entries table first
  const sqlInsertEntry = `INSERT INTO entries (date, timeIn, timeOut, totalHours, comment, foremanId, propertyName)
                          VALUES (?, ?, ?, ?, ?, ?, ?)`;
  db.run(
    sqlInsertEntry,
    [date, timeIn, timeOut, totalHours, comment, foremanId, propertyName],
    function (err) {
      if (err) {
        console.error('Insert entry error:', err);
        return res.status(500).json({ success: false, error: 'Failed to insert entry' });
      }
      const entryId = this.lastID;

      // Insert employee times
      const insertEmployeeTime = db.prepare(
        `INSERT INTO entry_employee_times (entryId, employeeId, timeIn, timeOut) VALUES (?, ?, ?, ?)`
      );
      for (const empId in employeeTimes) {
        const times = employeeTimes[empId];
        insertEmployeeTime.run(entryId, empId, times.timeIn, times.timeOut);
      }
      insertEmployeeTime.finalize();

      // Insert employee hours
      const insertEmployeeHours = db.prepare(
        `INSERT INTO entry_employee_hours (entryId, employeeId, category, hours) VALUES (?, ?, ?, ?)`
      );
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

// GET entry by id with all details
app.get('/api/entries/:id', (req, res) => {
  const entryId = req.params.id;

  db.get(`SELECT * FROM entries WHERE id = ?`, [entryId], (err, entry) => {
    if (err || !entry) {
      console.error('Fetch entry error:', err);
      return res.status(404).json({ success: false, error: 'Entry not found' });
    }

    // Fetch employee times
    db.all(
      `SELECT employeeId, timeIn, timeOut FROM entry_employee_times WHERE entryId = ?`,
      [entryId],
      (err, employeeTimes) => {
        if (err) {
          console.error('Fetch employee times error:', err);
          return res.status(500).json({ success: false, error: 'Failed to fetch employee times' });
        }

        // Format employeeTimes as { employeeId: { timeIn, timeOut }, ... }
        const employeeTimesObj = {};
        employeeTimes.forEach((et) => {
          employeeTimesObj[et.employeeId] = { timeIn: et.timeIn, timeOut: et.timeOut };
        });

        // Fetch employee hours
        db.all(
          `SELECT employeeId, category, hours FROM entry_employee_hours WHERE entryId = ?`,
          [entryId],
          (err, employeeHours) => {
            if (err) {
              console.error('Fetch employee hours error:', err);
              return res.status(500).json({ success: false, error: 'Failed to fetch employee hours' });
            }

            // Format hoursData as { employeeId: { category: hours, ... }, ... }
            const hoursDataObj = {};
            employeeHours.forEach(({ employeeId, category, hours }) => {
              if (!hoursDataObj[employeeId]) hoursDataObj[employeeId] = {};
              hoursDataObj[employeeId][category] = hours;
            });

            // Send combined entry data
            res.json({
              ...entry,
              employeeTimes: employeeTimesObj,
              hoursData: hoursDataObj,
            });
          }
        );
      }
    );
  });
});

// PUT update existing entry
app.put('/api/entries/:id', (req, res) => {
  const entryId = req.params.id;
  const {
    date,
    timeIn,
    timeOut,
    totalHours,
    comment,
    foremanId,
    propertyName,
    employeeTimes,
    hoursData,
  } = req.body;

  // Update entries table
  const sqlUpdateEntry = `UPDATE entries SET
                          date = ?, timeIn = ?, timeOut = ?, totalHours = ?, comment = ?,
                          foremanId = ?, propertyName = ?
                          WHERE id = ?`;

  db.run(
    sqlUpdateEntry,
    [date, timeIn, timeOut, totalHours, comment, foremanId, propertyName, entryId],
    function (err) {
      if (err) {
        console.error('Update entry error:', err);
        return res.status(500).json({ success: false, error: 'Failed to update entry' });
      }

      // Delete old employee times and hours for this entry
      db.run(`DELETE FROM entry_employee_times WHERE entryId = ?`, [entryId], (err) => {
        if (err) {
          console.error('Delete old employee times error:', err);
          return res.status(500).json({ success: false, error: 'Failed to delete old employee times' });
        }

        // Insert new employee times
        const insertEmployeeTime = db.prepare(
          `INSERT INTO entry_employee_times (entryId, employeeId, timeIn, timeOut) VALUES (?, ?, ?, ?)`
        );
        for (const empId in employeeTimes) {
          const times = employeeTimes[empId];
          insertEmployeeTime.run(entryId, empId, times.timeIn, times.timeOut);
        }
        insertEmployeeTime.finalize();

        // Delete old employee hours
        db.run(`DELETE FROM entry_employee_hours WHERE entryId = ?`, [entryId], (err) => {
          if (err) {
            console.error('Delete old employee hours error:', err);
            return res.status(500).json({ success: false, error: 'Failed to delete old employee hours' });
          }

          // Insert new employee hours
          const insertEmployeeHours = db.prepare(
            `INSERT INTO entry_employee_hours (entryId, employeeId, category, hours) VALUES (?, ?, ?, ?)`
          );
          for (const empId in hoursData) {
            const categories = hoursData[empId];
            for (const category in categories) {
              insertEmployeeHours.run(entryId, empId, category, categories[category]);
            }
          }
          insertEmployeeHours.finalize();

          res.json({ success: true });
        });
      });
    }
  );
});

// Other existing routes (login, latest entries) remain unchanged
// GET lastest entries simplified to just entries table
app.get('/api/entries/latest', (req, res) => {
  const sql = `SELECT * FROM entries ORDER BY id DESC LIMIT 15`;
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Fetch entries error:', err);
      return res.status(500).json({ success: false, error: 'Failed to fetch entries' });
    }
    res.json(rows);
  });
});

// Login route remains unchanged
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  console.log('Login attempt:', username, password);

  db.get(`SELECT * FROM users WHERE username = ? AND password = ?`, [username, password], (err, row) => {
    if (err) {
      console.error('DB error:', err);
      return res.status(500).json({ success: false, error: 'DB error' });
    }
    console.log('DB query result:', row);
    if (row) {
      res.json({ success: true, user: { id: row.id, username: row.username } });
    } else {
      res.json({ success: false, error: 'Invalid credentials' });
    }
  });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
