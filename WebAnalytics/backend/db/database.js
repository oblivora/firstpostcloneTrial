const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

let pool;

async function initDb() {
    if (pool) return pool;

    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    // Run schema (CREATE TABLE IF NOT EXISTS is idempotent)
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await pool.query(schema);

    return pool;
}

function getDb() {
    if (!pool) throw new Error('Database not initialized. Call initDb() first.');
    return pool;
}

module.exports = { initDb, getDb };
