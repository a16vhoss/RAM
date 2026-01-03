import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'ram.db');

let db;

if (!global.db) {
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    global.db = db;
} else {
    db = global.db;
}

export default db;
