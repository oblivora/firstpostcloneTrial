const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'analytics.db');

let db; // single shared instance

function initDb() {
    if (db) return Promise.resolve(db);

    db = new Database(DB_PATH);

    // Enable WAL for better concurrent read performance
    db.pragma('journal_mode = WAL');

    // Run schema (CREATE TABLE IF NOT EXISTS is idempotent)
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    db.exec(schema);

    return Promise.resolve(db);
}

function getDb() {
    if (!db) throw new Error('Database not initialized. Call initDb() first.');
    return db;
}

module.exports = { initDb, getDb };
