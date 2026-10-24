const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://botuser:botpassword@localhost:5432/trading_bot_db',
    max: 5
});

async function logBot(level, message) {
    try {
        console.log(`[${new Date().toISOString()}] [${level}] ${message}`);
        await pool.query('INSERT INTO bot_logs (level, message) VALUES ($1, $2)', [level, message]);
    } catch (err) {
        console.error('Erreur DB Log:', err.message);
    }
}

module.exports = { pool, logBot };
