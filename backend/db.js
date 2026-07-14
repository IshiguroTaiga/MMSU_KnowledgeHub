import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const containerDataDir = path.join(__dirname, 'data');
const localDataDir = path.join(__dirname, '..', 'data');
const DATA_DIR = fs.existsSync(containerDataDir) ? containerDataDir : localDataDir;

const DB_PATH = path.join(DATA_DIR, 'database.sqlite');

// Initialize sqlite3 database connection
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('[Database] Error opening database:', err);
  } else {
    console.log('[Database] Connected to SQLite database at:', DB_PATH);
    initializeTables();
  }
});

function initializeTables() {
  db.serialize(() => {
    // Create users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT UNIQUE,
        password TEXT,
        role TEXT,
        studentId TEXT UNIQUE,
        college TEXT
      )
    `);

    // Create smtp_config table
    db.run(`
      CREATE TABLE IF NOT EXISTS smtp_config (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        provider TEXT,
        senderName TEXT,
        senderEmail TEXT,
        host TEXT,
        port INTEGER,
        username TEXT,
        password TEXT
      )
    `);

    // Create hits table
    db.run(`
      CREATE TABLE IF NOT EXISTS hits (
        id TEXT PRIMARY KEY,
        count INTEGER DEFAULT 0
      )
    `);

    // Seed default users if users table is empty
    db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
      if (err) return console.error(err);
      if (row.count === 0) {
        console.log('[Database] Seeding default users...');
        const defaultUsers = [
          { name: 'Ishi (THerta)', email: 'ishi@dev.me', password: 'SQDZerO2', role: 'Super Admin', studentId: '23-140015', college: 'CCIS' },
          { name: 'Faculty Evaluator', email: 'faculty@mmsu.edu.ph', password: 'password123', role: 'Faculty', studentId: '00-000001', college: 'CCIS' },
          { name: 'Regular Student', email: 'student@mmsu.edu.ph', password: 'password123', role: 'Student', studentId: '23-100001', college: 'CCIS' }
        ];
        const stmt = db.prepare("INSERT INTO users (name, email, password, role, studentId, college) VALUES (?, ?, ?, ?, ?, ?)");
        defaultUsers.forEach(u => {
          stmt.run(u.name, u.email, u.password, u.role, u.studentId, u.college);
        });
        stmt.finalize();
      }
      // Ensure primary developer name is kept in sync with any updates
      db.run("UPDATE users SET name = 'Ishi (THerta)' WHERE email = 'ishi@dev.me'");
    });

    // Seed default smtp config if smtp_config table is empty
    db.get("SELECT COUNT(*) as count FROM smtp_config", (err, row) => {
      if (err) return console.error(err);
      if (row.count === 0) {
        console.log('[Database] Seeding default SMTP config...');
        db.run(`
          INSERT INTO smtp_config (id, provider, senderName, senderEmail, host, port, username, password)
          VALUES (1, 'Outlook / Office 365', 'MMSU Knowledge Hub', 'hub@mmsu.edu.ph', 'smtp.office365.com', 587, 'mickogabriel75@gmail.com', 'app-password-placeholder')
        `);
      }
    });

    // Seed hits (INSERT OR IGNORE ensures keys exist even if database is already created)
    const defaultHits = [
      'shifting', 'mrr', 'honors', 'clearance',
      'portal', 'mvle', 'library', 'tracking', 'mcat', 'alumni',
      'news_dost', 'news_suspension'
    ];
    defaultHits.forEach(key => {
      db.run("INSERT OR IGNORE INTO hits (id, count) VALUES (?, 0)", [key]);
    });
  });
}

export const dbQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

export const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

export default db;
