const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Failed to open database:', err.message);
    return;
  }
  console.log('Connected to SQLite database.');
});

// Wrap in a transaction to ensure integrity
db.serialize(() => {
  db.run('BEGIN TRANSACTION;');

  // Delete all entry-related data first (child tables)
  db.run('DELETE FROM entry_employee_times;', (err) => {
    if (err) console.error('Error deleting entry_employee_times:', err.message);
    else console.log('Deleted all entry_employee_times');
  });

  db.run('DELETE FROM entry_employee_hours;', (err) => {
    if (err) console.error('Error deleting entry_employee_hours:', err.message);
    else console.log('Deleted all entry_employee_hours');
  });

  // Delete entries themselves
  db.run('DELETE FROM entries;', (err) => {
    if (err) console.error('Error deleting entries:', err.message);
    else console.log('Deleted all entries');
  });

  db.run('COMMIT;', (err) => {
    if (err) console.error('Transaction commit failed:', err.message);
    else console.log('Transaction committed successfully. All entries cleared.');
  });
});

db.close((err) => {
  if (err) {
    console.error('Error closing database:', err.message);
  } else {
    console.log('Database connection closed.');
  }
});
