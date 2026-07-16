import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import pg from 'pg';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const containerDataDir = path.join(__dirname, 'data');
const localDataDir = path.join(__dirname, '..', 'data');
const DATA_DIR = fs.existsSync(containerDataDir) ? containerDataDir : localDataDir;

const DB_PATH = path.join(DATA_DIR, 'database.sqlite');

// Determine database type (Local SQLite vs Cloud Postgres for Render persistence)
const isPostgres = !!process.env.DATABASE_URL;
let pgPool = null;
let sqliteDb = null;

if (isPostgres) {
  console.log('[Database] Connecting to cloud PostgreSQL database...');
  pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // Required for Supabase/Neon SSL handshakes on Render
    }
  });
  initializeTables();
} else {
  // Initialize sqlite3 database connection locally
  sqliteDb = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error('[Database] Error opening SQLite database:', err);
    } else {
      console.log('[Database] Connected to SQLite database at:', DB_PATH);
      initializeTables();
    }
  });
}

// SQL query helper to convert SQLite syntax to PostgreSQL syntax dynamically
function convertSql(sql) {
  if (!isPostgres) return sql;

  let pgSql = sql;
  
  // Replace ? placeholders with PostgreSQL $1, $2, $3...
  let index = 1;
  pgSql = pgSql.replace(/\?/g, () => `$${index++}`);

  // Convert INSERT OR IGNORE syntax
  if (pgSql.toUpperCase().includes('INSERT OR IGNORE')) {
    pgSql = pgSql.replace(/INSERT OR IGNORE/gi, 'INSERT');
    if (!pgSql.toUpperCase().includes('ON CONFLICT')) {
      pgSql += ' ON CONFLICT DO NOTHING';
    }
  }

  // Convert SQLite AUTOINCREMENT syntax to PostgreSQL serial
  pgSql = pgSql.replace(/INTEGER PRIMARY KEY AUTOINCREMENT/gi, 'SERIAL PRIMARY KEY');
  
  return pgSql;
}

function initializeTables() {
  if (isPostgres) {
    runPgInit();
  } else {
    runSqliteInit();
  }
}

async function runPgInit() {
  try {
    // Create users table
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT,
        email TEXT UNIQUE,
        password TEXT,
        role TEXT,
        studentId TEXT UNIQUE,
        college TEXT
      )
    `);

    // Create smtp_config table
    await pgPool.query(`
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
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS hits (
        id TEXT PRIMARY KEY,
        count INTEGER DEFAULT 0
      )
    `);

    // Seed default users if table is empty
    const userCountRes = await pgPool.query("SELECT COUNT(*) as count FROM users");
    const count = parseInt(userCountRes.rows[0].count, 10);
    if (count === 0) {
      console.log('[Database] Seeding default users in Postgres...');
      const defaultUsers = [
        { name: 'Ishi (THerta)', email: 'ishi@dev.me', password: 'SQDZerO2', role: 'Super Admin', studentId: '23-140015', college: 'CCIS' },
        { name: 'Faculty Evaluator', email: 'faculty@mmsu.edu.ph', password: 'password123', role: 'Faculty', studentId: '00-000001', college: 'CCIS' },
        { name: 'Regular Student', email: 'student@mmsu.edu.ph', password: 'password123', role: 'Student', studentId: '23-100001', college: 'CCIS' }
      ];
      for (const u of defaultUsers) {
        await pgPool.query(
          "INSERT INTO users (name, email, password, role, studentId, college) VALUES ($1, $2, $3, $4, $5, $6)",
          [u.name, u.email, u.password, u.role, u.studentId, u.college]
        );
      }
    }

    // Ensure dev name is always updated
    await pgPool.query("UPDATE users SET name = 'Ishi (THerta)' WHERE email = 'ishi@dev.me'");

    // Seed default SMTP config if empty
    const smtpCountRes = await pgPool.query("SELECT COUNT(*) as count FROM smtp_config");
    const smtpCount = parseInt(smtpCountRes.rows[0].count, 10);
    if (smtpCount === 0) {
      console.log('[Database] Seeding default SMTP config in Postgres...');
      await pgPool.query(`
        INSERT INTO smtp_config (id, provider, senderName, senderEmail, host, port, username, password)
        VALUES (1, 'Outlook / Office 365', 'MMSU Knowledge Hub', 'hub@mmsu.edu.ph', 'smtp.office365.com', 587, 'mickogabriel75@gmail.com', 'app-password-placeholder')
      `);
    }

    // Seed default hit keys
    const defaultHits = [
      'shifting', 'mrr', 'honors', 'clearance',
      'portal', 'mvle', 'library', 'tracking', 'mcat', 'alumni',
      'news_dost', 'news_suspension'
    ];
    for (const key of defaultHits) {
      await pgPool.query("INSERT INTO hits (id, count) VALUES ($1, 0) ON CONFLICT (id) DO NOTHING", [key]);
    }

    console.log('[Database] Cloud PostgreSQL initialization completed successfully.');
  } catch (err) {
    console.error('[Database] PostgreSQL initialization error:', err);
  }
}

function runSqliteInit() {
  sqliteDb.serialize(() => {
    // Create users table
    sqliteDb.run(`
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
    sqliteDb.run(`
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
    sqliteDb.run(`
      CREATE TABLE IF NOT EXISTS hits (
        id TEXT PRIMARY KEY,
        count INTEGER DEFAULT 0
      )
    `);

    // Seed default users if users table is empty
    sqliteDb.get("SELECT COUNT(*) as count FROM users", (err, row) => {
      if (err) return console.error(err);
      if (row.count === 0) {
        console.log('[Database] Seeding default users...');
        const defaultUsers = [
          { name: 'Ishi (THerta)', email: 'ishi@dev.me', password: 'SQDZerO2', role: 'Super Admin', studentId: '23-140015', college: 'CCIS' },
          { name: 'Faculty Evaluator', email: 'faculty@mmsu.edu.ph', password: 'password123', role: 'Faculty', studentId: '00-000001', college: 'CCIS' },
          { name: 'Regular Student', email: 'student@mmsu.edu.ph', password: 'password123', role: 'Student', studentId: '23-100001', college: 'CCIS' }
        ];
        const stmt = sqliteDb.prepare("INSERT INTO users (name, email, password, role, studentId, college) VALUES (?, ?, ?, ?, ?, ?)");
        defaultUsers.forEach(u => {
          stmt.run(u.name, u.email, u.password, u.role, u.studentId, u.college);
        });
        stmt.finalize();
      }
      // Ensure primary developer name is kept in sync with any updates
      sqliteDb.run("UPDATE users SET name = 'Ishi (THerta)' WHERE email = 'ishi@dev.me'");
    });

    // Seed default smtp config if smtp_config table is empty
    sqliteDb.get("SELECT COUNT(*) as count FROM smtp_config", (err, row) => {
      if (err) return console.error(err);
      if (row.count === 0) {
        console.log('[Database] Seeding default SMTP config...');
        sqliteDb.run(`
          INSERT INTO smtp_config (id, provider, senderName, senderEmail, host, port, username, password)
          VALUES (1, 'Outlook / Office 365', 'MMSU Knowledge Hub', 'hub@mmsu.edu.ph', 'smtp.office365.com', 587, 'mickogabriel75@gmail.com', 'app-password-placeholder')
        `);
      }
    });

    // Seed hits
    const defaultHits = [
      'shifting', 'mrr', 'honors', 'clearance',
      'portal', 'mvle', 'library', 'tracking', 'mcat', 'alumni',
      'news_dost', 'news_suspension'
    ];
    defaultHits.forEach(key => {
      sqliteDb.run("INSERT OR IGNORE INTO hits (id, count) VALUES (?, 0)", [key]);
    });
  });
}

export const dbQuery = (sql, params = []) => {
  if (isPostgres) {
    return pgPool.query(convertSql(sql), params).then(res => res.rows);
  } else {
    return new Promise((resolve, reject) => {
      sqliteDb.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
};

export const dbGet = (sql, params = []) => {
  if (isPostgres) {
    return pgPool.query(convertSql(sql), params).then(res => res.rows[0] || null);
  } else {
    return new Promise((resolve, reject) => {
      sqliteDb.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }
};

export const dbRun = (sql, params = []) => {
  if (isPostgres) {
    let pgSql = convertSql(sql);
    const isInsert = pgSql.trim().toUpperCase().startsWith('INSERT');
    // For inserts in PG, append RETURNING id to capture last ID inserted
    if (isInsert && !pgSql.toUpperCase().includes('RETURNING')) {
      pgSql += ' RETURNING id';
    }

    return pgPool.query(pgSql, params).then(res => {
      const insertedId = res.rows && res.rows[0] ? res.rows[0].id : null;
      return { id: insertedId, changes: res.rowCount };
    });
  } else {
    return new Promise((resolve, reject) => {
      sqliteDb.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  }
};

export default isPostgres ? pgPool : sqliteDb;
