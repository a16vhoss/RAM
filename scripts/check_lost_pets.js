require('dotenv').config({ path: '.env' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function checkColumns() {
    try {
        console.log('--- COLUMN CHECK START ---');
        // Get one row to see keys
        const res = await pool.query("SELECT * FROM pets LIMIT 1");
        if (res.rows.length > 0) {
            console.log('Columns in pets table:', Object.keys(res.rows[0]).join(', '));
        } else {
            console.log('No rows in pets table. Checking schema...');
            const res2 = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'pets'");
            console.log('Columns (schema):', res2.rows.map(r => r.column_name).join(', '));
        }
        console.log('--- COLUMN CHECK END ---');
    } catch (error) {
        console.error(error);
    } finally {
        await pool.end();
    }
}

checkColumns();
