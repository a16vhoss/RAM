
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const envLocalPath = path.resolve(process.cwd(), '.env.local');
const envPath = path.resolve(process.cwd(), '.env');

dotenv.config({ path: envLocalPath });

if (!process.env.DATABASE_URL) {
    console.log('DATABASE_URL not found in .env.local, trying .env...');
    dotenv.config({ path: envPath });
}

if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is missing from environment variables');
    process.exit(1);
}

const { Pool } = pg;

async function runMigration() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });

    try {
        const MIGRATION_FILE = '05_fix_pet_owners_fk.sql';
        const sqlPath = path.join(__dirname, MIGRATION_FILE);
        const sql = fs.readFileSync(sqlPath, 'utf8');
        console.log('Running migration...');
        await pool.query(sql);
        console.log('Migration successful!');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await pool.end();
    }
}

runMigration();
