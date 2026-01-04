import { Pool } from 'pg';

let conn;

if (!conn) {
    conn = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
}

export const query = async (text, params) => {
    const start = Date.now();
    const res = await conn.query(text, params);
    const duration = Date.now() - start;
    // console.log('executed query', { text, duration, rows: res.rowCount });
    return res;
};

// Helper for "get one" (SQLite .get)
export const getOne = async (text, params) => {
    const res = await query(text, params);
    return res.rows[0];
};

// Helper for "get all" (SQLite .all)
export const getAll = async (text, params) => {
    const res = await query(text, params);
    return res.rows;
};

// Helper for "run/insert" (SQLite .run) -> returns { rows: [], rowCount }
// For INSERT RETURNING, you get rows.
export const run = async (text, params) => {
    return await query(text, params);
};

export default conn;
