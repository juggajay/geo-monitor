import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "beta-applications.db");

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    // Ensure data directory exists
    const fs = require("fs");
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");

    // Create table if not exists
    db.exec(`
      CREATE TABLE IF NOT EXISTS applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        work_email TEXT NOT NULL,
        agency_name TEXT NOT NULL,
        website TEXT,
        active_clients_range TEXT NOT NULL,
        role TEXT,
        primary_services TEXT NOT NULL,
        biggest_challenge TEXT NOT NULL,
        qualified_status TEXT NOT NULL DEFAULT 'review',
        pipeline_stage TEXT NOT NULL DEFAULT 'NEW',
        utm_source TEXT,
        utm_medium TEXT,
        utm_campaign TEXT,
        utm_content TEXT,
        utm_term TEXT,
        first_touch_json TEXT,
        last_touch_json TEXT,
        submitted_at TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);
  }

  return db;
}
