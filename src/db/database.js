const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const dataDir = path.resolve(__dirname, '..', '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'budget.db');
const db = new Database(dbPath);

function initializeDatabase() {
  const schemaPath = path.join(dataDir, 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schema = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schema);
    console.log('Database initialized successfully.');
  } else {
    console.error('schema.sql not found. Cannot initialize database.');
  }
}

// Check if the database is new (no tables)
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
if (tables.length === 0) {
  initializeDatabase();
}

module.exports = { db };
