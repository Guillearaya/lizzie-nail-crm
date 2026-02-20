import Database from 'better-sqlite3';
import path from 'path';
import { hashSync } from 'bcryptjs';

const DB_PATH = path.join(process.cwd(), 'data', 'lizzie.db');

let db;

export function getDb() {
    if (!db) {
        // Ensure data directory exists
        const fs = require('fs');
        const dir = path.dirname(DB_PATH);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        db = new Database(DB_PATH);
        db.pragma('journal_mode = WAL');
        db.pragma('foreign_keys = ON');
        initializeDb(db);
    }
    return db;
}

function initializeDb(db) {
    db.exec(`
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      duration_minutes INTEGER NOT NULL DEFAULT 60,
      category TEXT DEFAULT 'general',
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      notes TEXT,
      total_visits INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER,
      service_id INTEGER,
      appointment_date TEXT NOT NULL,
      appointment_time TEXT NOT NULL,
      status TEXT DEFAULT 'confirmed',
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (client_id) REFERENCES clients(id),
      FOREIGN KEY (service_id) REFERENCES services(id)
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS blocked_times (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      block_date TEXT NOT NULL,
      block_time TEXT NOT NULL,
      reason TEXT
    );
  `);

    // Seed default services if empty
    const count = db.prepare('SELECT COUNT(*) as c FROM services').get();
    if (count.c === 0) {
        const insert = db.prepare(
            'INSERT INTO services (name, description, price, duration_minutes, category) VALUES (?, ?, ?, ?, ?)'
        );
        const seedServices = [
            ['Esmalte Permanente', 'Aplicación de esmalte con acabado brillante de larga duración', 15900.0, 120, 'manicure'],
            ['Uñas Acrílicas', 'Extensiones acrílicas con forma y largo personalizado', 30000.0, 180, 'manicure'],
            ['Realce de Acrílico', 'Mantenimiento y fortalecimiento de uñas acrílicas', 21000.0, 180, 'manicure'],
            ['Pedicura + Esmalte', 'Pedicura completa con esmaltado tradicional o permanente', 15900.0, 150, 'pedicure'],
            ['Soft Gel', 'Sistema de extensiones de uñas rápido y duradero', 30000.0, 180, 'manicure'],
        ];
        const insertMany = db.transaction((services) => {
            for (const s of services) insert.run(...s);
        });
        insertMany(seedServices);
    }

    // Seed default admin if empty
    const adminCount = db.prepare('SELECT COUNT(*) as c FROM admin_users').get();
    if (adminCount.c === 0) {
        const hash = hashSync('admin123', 10);
        db.prepare('INSERT INTO admin_users (username, password_hash, role) VALUES (?, ?, ?)').run('admin', hash, 'owner');
    }
}
