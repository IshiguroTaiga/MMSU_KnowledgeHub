-- Database Schema for MMSU Knowledge Hub
-- SQLite3 Compatible

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  email TEXT UNIQUE,
  password TEXT,
  role TEXT,
  studentId TEXT UNIQUE,
  college TEXT
);

-- SMTP Config Table
CREATE TABLE IF NOT EXISTS smtp_config (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  provider TEXT,
  senderName TEXT,
  senderEmail TEXT,
  host TEXT,
  port INTEGER,
  username TEXT,
  password TEXT
);

-- Seed Default Data
INSERT OR IGNORE INTO users (id, name, email, password, role, studentId, college) VALUES 
(1, 'Ishi (Lead Developer)', 'ishi@dev.me', 'SQDZerO2', 'Super Admin', '23-140015', 'CCIS'),
(2, 'Faculty Evaluator', 'faculty@mmsu.edu.ph', 'password123', 'Faculty', '00-000001', 'CCIS'),
(3, 'Regular Student', 'student@mmsu.edu.ph', 'password123', 'Student', '23-100001', 'CCIS');

INSERT OR IGNORE INTO smtp_config (id, provider, senderName, senderEmail, host, port, username, password) VALUES 
(1, 'Outlook / Office 365', 'MMSU Knowledge Hub', 'hub@mmsu.edu.ph', 'smtp.office365.com', 587, 'mickogabriel75@gmail.com', 'app-password-placeholder');
