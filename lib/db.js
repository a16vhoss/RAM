import { Pool } from 'pg';

let pool;

const getPool = () => {
    if (!pool) {
        if (!process.env.DATABASE_URL) {
            throw new Error('DATABASE_URL is not defined');
        }
        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        });
    }
    return pool;
};

export const query = async (text, params) => {
    const start = Date.now();
    const res = await getPool().query(text, params);
    const duration = Date.now() - start;
    // console.log('executed query', { text, duration, rows: res.rowCount });
    return res;
};

export const getOne = async (text, params) => {
    const res = await query(text, params);
    return res.rows[0];
};

export const getAll = async (text, params) => {
    const res = await query(text, params);
    return res.rows;
};

export const run = async (text, params) => {
    const res = await query(text, params);
    return res;
};

const db = {
    query,
    getOne,
    getAll,
    run
};

export default db;
