import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import { HandbookSearchEngine } from './rag.js';
import { CurriculumPathfinder } from './pathfinder.js';

// Setup directories and paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const STARTUP_TIME = Date.now();
const PORT = 5191; // Port outside the 5173 - 5180 range

app.get('/api/version', (req, res) => {
  res.json({ version: STARTUP_TIME });
});

app.use(cors());
app.use(express.json());

// Initialize CS Engines on startup
const searchEngine = new HandbookSearchEngine();
const pathfinder = new CurriculumPathfinder();

// Resolve data directory dynamically (check both container path '/app/data' and local path '../data')
const containerDataDir = path.join(__dirname, 'data');
const localDataDir = path.join(__dirname, '..', 'data');
const DATA_DIR = fs.existsSync(containerDataDir) ? containerDataDir : localDataDir;

const HANDBOOK_PATH = path.join(DATA_DIR, 'mmsu_handbook.md');
const CURRICULUM_PATH = path.join(DATA_DIR, 'curriculum', 'bscs_curriculum.json');

searchEngine.initialize(HANDBOOK_PATH);
pathfinder.initialize(CURRICULUM_PATH);

// ----------------------------------------------------
// DATABASE (SQLite Connected via db.js)
// ----------------------------------------------------
import { dbQuery, dbGet, dbRun } from './db.js';

// ----------------------------------------------------
// AUTHENTICATION ENDPOINTS
// ----------------------------------------------------

// User Login (accepts Email or Student ID)
app.post('/api/login', async (req, res) => {
  const { loginIdentifier, password } = req.body;
  
  if (!loginIdentifier || !password) {
    return res.status(400).json({ error: 'Please enter both credentials.' });
  }

  try {
    const user = await dbGet(
      "SELECT * FROM users WHERE (LOWER(email) = ? OR studentId = ?) AND password = ?",
      [loginIdentifier.toLowerCase(), loginIdentifier, password]
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials. Check your email/Student ID and password.' });
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        college: user.college
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error during login.' });
  }
});

// Student Self-Registration
app.post('/api/register', async (req, res) => {
  const { studentId, email, password } = req.body;

  if (!studentId || !email || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  // Student number validation format xx-xxxxxx
  const studentIdRegex = /^\d{2}-\d{6}$/;
  if (!studentIdRegex.test(studentId)) {
    return res.status(400).json({ error: 'Invalid Student ID format. Must be xx-xxxxxx.' });
  }

  // Email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }

  try {
    // Duplicate checks
    const exists = await dbGet(
      "SELECT id FROM users WHERE LOWER(email) = ? OR studentId = ?",
      [email.toLowerCase(), studentId]
    );
    if (exists) {
      return res.status(400).json({ error: 'User with this email or Student ID already exists.' });
    }

    const name = `Student (${studentId})`;
    const role = 'Student';
    const college = 'CCIS';
    const result = await dbRun(
      "INSERT INTO users (name, email, password, role, studentId, college) VALUES (?, ?, ?, ?, ?, ?)",
      [name, email, password, role, studentId, college]
    );

    const newUser = {
      id: result.id,
      name,
      email,
      password,
      role,
      studentId,
      college
    };

    res.json({ message: 'Registration successful! You can now log in.', user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error during registration.' });
  }
});

// ----------------------------------------------------
// USER CRUD ENDPOINTS (For Admins/Devs)
// ----------------------------------------------------
app.get('/api/users', async (req, res) => {
  try {
    const usersList = await dbQuery("SELECT * FROM users");
    res.json({ users: usersList });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error fetching users.' });
  }
});

// Helper function to send welcome email with a temporary password (matching DOST)
async function sendWelcomeEmail(userEmail, name, tempPassword) {
  try {
    const config = await dbGet("SELECT * FROM smtp_config WHERE id = 1");
    if (!config || !config.username || !config.password) {
      console.warn('[Mailer] SMTP credentials not configured. Skipping email.');
      return { success: false, error: 'SMTP credentials not configured' };
    }

    const senderName = config.senderName || 'MMSU Knowledge Hub';
    const senderEmail = config.senderEmail || config.username;
    const fromAddress = `"${senderName}" <${senderEmail}>`;

    const transporter = nodemailer.createTransport({
      host: config.host || 'smtp.office365.com',
      port: config.port || 587,
      secure: config.port === 465,
      auth: {
        user: config.username,
        pass: config.password,
      },
      tls: {
        rejectUnauthorized: config.port === 587 || config.port === 25 ? false : true,
      }
    });

    const clientUrl = 'http://localhost:5173'; // default frontend URL

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          .email-container {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #1e293b;
            max-width: 600px;
            margin: 0 auto;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            overflow: hidden;
            background-color: #ffffff;
          }
          .header {
            background: linear-gradient(135deg, #053b21 0%, #d97706 100%);
            padding: 32px 24px;
            text-align: center;
          }
          .header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 24px;
            font-weight: 700;
            letter-spacing: -0.025em;
          }
          .content {
            padding: 32px 24px;
          }
          .welcome-text {
            font-size: 18px;
            font-weight: 600;
            color: #0f172a;
            margin-bottom: 16px;
          }
          .info-box {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 24px;
            margin: 24px 0;
            text-align: center;
          }
          .label {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #64748b;
            font-weight: 700;
            margin-bottom: 8px;
            display: block;
          }
          .password-value {
            font-family: 'Courier New', Courier, monospace;
            font-size: 28px;
            font-weight: 700;
            color: #1e293b;
            letter-spacing: 2px;
            margin: 12px 0;
            display: block;
          }
          .copy-hint {
            font-size: 12px;
            color: #94a3b8;
            margin-top: 8px;
          }
          .btn-container {
            text-align: center;
            margin-top: 32px;
          }
          .btn {
            background-color: #053b21;
            color: #ffffff !important;
            padding: 12px 32px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 600;
            display: inline-block;
          }
          .footer {
            background-color: #f1f5f9;
            padding: 24px;
            text-align: center;
            font-size: 13px;
            color: #64748b;
          }
          .footer p {
            margin: 4px 0;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1>MMSU KNOWLEDGE HUB</h1>
          </div>
          <div class="content">
            <div class="welcome-text">Welcome, ${name}!</div>
            <p>Your academic portal account has been successfully created. You can now access the MMSU Knowledge Hub using the credentials below.</p>
            
            <div class="info-box">
              <span class="label">Registered Email</span>
              <div style="font-weight: 600; font-size: 16px; color: #1e293b; margin-bottom: 20px;">${userEmail}</div>
              
              <span class="label">Temporary Password</span>
              <div style="margin: 12px 0; display: inline-block; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 8px 16px; position: relative;">
                <span class="password-value" style="margin: 0; display: inline; user-select: all; -webkit-user-select: all;">${tempPassword}</span>
              </div>
              <div class="copy-hint">Tip: Use this password to log in for the first time.</div>
            </div>

            <p>For security reasons, you will be prompted to change this password immediately upon your first login.</p>
            
            <div class="btn-container">
              <a href="${clientUrl}" class="btn">Login to Dashboard</a>
            </div>
          </div>
          <div class="footer">
            <p>This is an automated message, please do not reply.</p>
            <p>&copy; ${new Date().getFullYear()} Mariano Marcos State University. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const info = await transporter.sendMail({
      from: fromAddress,
      to: userEmail,
      subject: "Welcome to MMSU Knowledge Hub - Your Account Details",
      html: htmlContent
    });

    console.log('[Mailer] Email sent successfully to:', userEmail, 'MessageId:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[Mailer] Nodemailer Error:', error.message);
    return { success: false, error: error.message };
  }
}

app.post('/api/users', async (req, res) => {
  const { name, email, password, role, studentId, college } = req.body;
  
  if (!email || !role || !studentId) {
    return res.status(400).json({ error: 'Fields email, role, and studentId are required.' });
  }

  try {
    const exists = await dbGet(
      "SELECT id FROM users WHERE LOWER(email) = ? OR studentId = ?",
      [email.toLowerCase(), studentId]
    );
    if (exists) {
      return res.status(400).json({ error: 'User with this email or Student ID already exists.' });
    }

    // Generate random 12-char password if blank
    let tempPassword = password;
    if (!tempPassword) {
      tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4).toUpperCase();
    }

    const userName = name || `User (${studentId})`;
    const userCollege = college || 'CCIS';
    const result = await dbRun(
      "INSERT INTO users (name, email, password, role, studentId, college) VALUES (?, ?, ?, ?, ?, ?)",
      [userName, email, tempPassword, role, studentId, userCollege]
    );

    const newUser = {
      id: result.id,
      name: userName,
      email,
      password: tempPassword,
      role,
      studentId,
      college: userCollege
    };

    // Attempt to send the welcome email asynchronously
    const emailResult = await sendWelcomeEmail(email, userName, tempPassword);

    res.json({ 
      message: 'User created successfully.', 
      user: newUser,
      tempPassword,
      emailSent: emailResult.success,
      emailError: emailResult.error
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error creating user.' });
  }
});

app.put('/api/users/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, email, password, role, studentId, college } = req.body;

  try {
    const user = await dbGet("SELECT * FROM users WHERE id = ?", [id]);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const updatedName = name !== undefined ? name : user.name;
    const updatedEmail = email !== undefined ? email : user.email;
    const updatedPassword = password !== undefined ? password : user.password;
    const updatedRole = role !== undefined ? role : user.role;
    const updatedStudentId = studentId !== undefined ? studentId : user.studentId;
    const updatedCollege = college !== undefined ? college : user.college;

    await dbRun(
      "UPDATE users SET name = ?, email = ?, password = ?, role = ?, studentId = ?, college = ? WHERE id = ?",
      [updatedName, updatedEmail, updatedPassword, updatedRole, updatedStudentId, updatedCollege, id]
    );

    res.json({
      message: 'User updated successfully.',
      user: {
        id,
        name: updatedName,
        email: updatedEmail,
        password: updatedPassword,
        role: updatedRole,
        studentId: updatedStudentId,
        college: updatedCollege
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error updating user.' });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const user = await dbGet("SELECT * FROM users WHERE id = ?", [id]);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Prevent self-deletion of dev account
    if (user.email === 'ishi@dev.me') {
      return res.status(403).json({ error: 'Cannot delete the primary developer account.' });
    }

    await dbRun("DELETE FROM users WHERE id = ?", [id]);
    res.json({ message: 'User deleted successfully.', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error deleting user.' });
  }
});

// ----------------------------------------------------
// SMTP SETTINGS ENDPOINTS
// ----------------------------------------------------
app.get('/api/settings', async (req, res) => {
  try {
    const smtpConfig = await dbGet("SELECT * FROM smtp_config WHERE id = 1");
    res.json({ smtpConfig });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error fetching settings.' });
  }
});

app.post('/api/settings', async (req, res) => {
  const { provider, senderName, senderEmail, host, port, username, password } = req.body;

  try {
    const current = await dbGet("SELECT * FROM smtp_config WHERE id = 1");
    
    const updatedProvider = provider !== undefined ? provider : current.provider;
    const updatedSenderName = senderName !== undefined ? senderName : current.senderName;
    const updatedSenderEmail = senderEmail !== undefined ? senderEmail : current.senderEmail;
    const updatedHost = host !== undefined ? host : current.host;
    const updatedPort = port !== undefined ? parseInt(port) : current.port;
    const updatedUsername = username !== undefined ? username : current.username;
    const updatedPassword = password !== undefined ? password : current.password;

    await dbRun(
      `UPDATE smtp_config 
       SET provider = ?, senderName = ?, senderEmail = ?, host = ?, port = ?, username = ?, password = ?
       WHERE id = 1`,
      [updatedProvider, updatedSenderName, updatedSenderEmail, updatedHost, updatedPort, updatedUsername, updatedPassword]
    );

    res.json({
      message: 'SMTP settings updated successfully.',
      smtpConfig: {
        provider: updatedProvider,
        senderName: updatedSenderName,
        senderEmail: updatedSenderEmail,
        host: updatedHost,
        port: updatedPort,
        username: updatedUsername,
        password: updatedPassword
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error updating settings.' });
  }
});

// ----------------------------------------------------
// CORE CS ENDPOINTS (Handbook, Pathfinder, Sync)
// ----------------------------------------------------
app.get('/api/search', (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ error: 'Query parameter q is required.' });
  }
  const results = searchEngine.search(q);
  res.json({ results });
});

app.get('/api/curriculum', (req, res) => {
  try {
    const rawData = pathfinder.courses;
    res.json({ courses: Object.values(rawData) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch curriculum.' });
  }
});

// Fetch all hit counts from database
app.get('/api/hits', async (req, res) => {
  try {
    const rows = await dbQuery("SELECT id, count FROM hits");
    const hitsMap = {};
    rows.forEach(row => {
      hitsMap[row.id] = row.count;
    });
    res.json({ hits: hitsMap });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error fetching hit counts.' });
  }
});

// Increment hit count for a specific key
app.post('/api/hits/:key/increment', async (req, res) => {
  const { key } = req.params;
  try {
    const exists = await dbGet("SELECT count FROM hits WHERE id = ?", [key]);
    if (exists !== undefined) {
      await dbRun("UPDATE hits SET count = count + 1 WHERE id = ?", [key]);
    } else {
      await dbRun("INSERT INTO hits (id, count) VALUES (?, 1)", [key]);
    }
    const updated = await dbGet("SELECT count FROM hits WHERE id = ?", [key]);
    res.json({ key, count: updated.count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error incrementing hit count.' });
  }
});

app.post('/api/recalculate', (req, res) => {
  const { failedCourses, currentYear, currentSemester } = req.body;
  try {
    const result = pathfinder.recalculatePlan(
      failedCourses || [],
      parseInt(currentYear) || 1,
      parseInt(currentSemester) || 1
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Recalculation engine failed.' });
  }
});

// Sync data store
let campusData = {
  Batac: [
    { id: 1, type: 'Event', content: 'University-wide Enrollment Period Begins', timestamp: 1718000000000 },
    { id: 2, type: 'Room', content: 'Batac CCIS Lab 1 reserved for CS 321 (Software Engineering)', timestamp: 1718100000000 },
    { id: 5, type: 'Schedule', content: 'CS 111 (Intro to Computing) scheduled for Mon/Wed 9:00 AM', timestamp: 1718120000000 },
    { id: 6, type: 'Notice', content: 'Batac Campus Sports Field closed for maintenance', timestamp: 1718150000000 }
  ],
  Laoag: [
    { id: 1, type: 'Event', content: 'University-wide Enrollment Period Begins', timestamp: 1718000000000 },
    { id: 3, type: 'Event', content: 'Laoag CTE Campus General Assembly & Orientation', timestamp: 1718050000000 },
    { id: 7, type: 'Room', content: 'Laoag Room 204 assigned to English 1 classes', timestamp: 1718130000000 },
    { id: 8, type: 'Schedule', content: 'PE 1 (Physical Fitness) moved to Friday 8:00 AM', timestamp: 1718170000000 }
  ],
  Currimao: [
    { id: 1, type: 'Event', content: 'University-wide Enrollment Period Begins', timestamp: 1718000000000 },
    { id: 4, type: 'Room', content: 'Currimao CASAT Fisheries Lab Maintenance', timestamp: 1718200000000 },
    { id: 9, type: 'Notice', content: 'Currimao Marine Biology seminar announced for next Tuesday', timestamp: 1718180000000 },
    { id: 10, type: 'Schedule', content: 'NSTP 1 (Civic Welfare Training) orientation scheduled', timestamp: 1718190000000 }
  ]
};

app.post('/api/sync', (req, res) => {
  const { nodeName, localLogs } = req.body;

  if (!nodeName || !campusData[nodeName]) {
    return res.status(400).json({ error: 'Invalid or missing nodeName.' });
  }

  const globalRegistry = {};

  Object.values(campusData).forEach(nodeList => {
    nodeList.forEach(item => {
      const existing = globalRegistry[item.id];
      if (!existing || item.timestamp > existing.timestamp) {
        globalRegistry[item.id] = item;
      }
    });
  });

  if (Array.isArray(localLogs)) {
    localLogs.forEach(item => {
      const existing = globalRegistry[item.id];
      if (!existing || item.timestamp > existing.timestamp) {
        globalRegistry[item.id] = item;
      }
    });
  }

  const unifiedData = Object.values(globalRegistry).sort((a, b) => a.id - b.id);
  Object.keys(campusData).forEach(key => {
    campusData[key] = [...unifiedData];
  });

  res.json({
    message: 'Synchronization completed successfully.',
    unifiedDatabaseSize: unifiedData.length,
    unifiedRecords: unifiedData
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`[Server] MMSU Knowledge Hub backend listening on http://localhost:${PORT}`);
});
