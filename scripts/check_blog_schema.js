require('dotenv').config({ path: '.env' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function checkBlogSchema() {
    try {
        console.log('--- BLOG SCHEMA CHECK ---');
        const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'blog_posts'");
        res.rows.forEach(r => console.log(`${r.column_name}: ${r.data_type}`));
        console.log('--- END ---');
    } catch (error) {
        console.error(error);
    } finally {
        await pool.end();
    }
}

checkBlogSchema();
