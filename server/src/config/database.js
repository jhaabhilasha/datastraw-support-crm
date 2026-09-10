import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure data directory exists
const dataDir = path.resolve(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = process.env.DB_PATH || path.join(dataDir, 'crm.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening SQLite database:', err.message);
  } else {
    console.log(`Connected to SQLite database at: ${dbPath}`);
  }
});

// Enable WAL mode & foreign keys for speed and reliability
db.serialize(() => {
  db.run('PRAGMA journal_mode = WAL;');
  db.run('PRAGMA foreign_keys = ON;');

  // 1. Tickets table
  db.run(`
    CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_id TEXT UNIQUE NOT NULL,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      subject TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Closed')),
      priority TEXT DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 2. Notes table
  db.run(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_id TEXT NOT NULL,
      note_text TEXT NOT NULL,
      author TEXT DEFAULT 'Support Agent',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id) ON DELETE CASCADE
    )
  `);

  // Indices for fast search and filtering
  db.run(`CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_tickets_email ON tickets(customer_email)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_notes_ticket_id ON notes(ticket_id)`);
});

// Async database helpers wrapping callbacks in Promises
export const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

export const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

/**
 * Generate sequential ticket ID: e.g. TKT-001, TKT-002, TKT-003
 */
export const generateNextTicketId = async () => {
  const row = await dbGet(`SELECT ticket_id FROM tickets ORDER BY id DESC LIMIT 1`);
  if (!row || !row.ticket_id) {
    return 'TKT-001';
  }
  const match = row.ticket_id.match(/^TKT-(\d+)$/);
  if (!match) {
    return `TKT-${Date.now().toString().slice(-4)}`;
  }
  const nextNum = parseInt(match[1], 10) + 1;
  return `TKT-${String(nextNum).padStart(3, '0')}`;
};

export default db;
