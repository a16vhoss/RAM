const { Pool } = require('pg');
const path = require('path');
require('dotenv').config();
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local'), override: true });

async function debugPosts() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('--- Checking Gatos Community ---');
        const [gatos] = (await pool.query("SELECT * FROM communities WHERE slug = 'gatos' OR name LIKE '%Gatos%'")).rows;

        if (!gatos) {
            console.error('Community Gatos not found');
            return;
        }
        console.log('Community ID:', gatos.community_id);

        console.log('\n--- Testing Full Feed Query ---');
        const exactFeedQuery = `
            SELECT 
                p.*,
                u.first_name,
                u.last_name,
                (SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.post_id) as likes_count,
                (SELECT COUNT(*) FROM post_comments pc WHERE pc.post_id = p.post_id) as comments_count
            FROM community_posts p
            LEFT JOIN users u ON p.user_id = u.user_id
            WHERE p.community_id = $1
            ORDER BY p.is_pinned DESC, p.created_at DESC
            LIMIT 20 OFFSET 0
        `;

        try {
            console.log('Running exact feed query...');
            const feedRes = await pool.query(exactFeedQuery, [gatos.community_id]);
            console.log(`Feed Query returned ${feedRes.rows.length} rows.`);
            if (feedRes.rows.length > 0) {
                console.log('First row keys:', Object.keys(feedRes.rows[0]));
                console.log('First row content:', feedRes.rows[0]);
            }
        } catch (qErr) {
            console.error('Feed Query FAILED:', qErr.message);
            // Check users columns
            console.log('\n--- Checking Users Schema ---');
            const schemaRes = await pool.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'users'
             `);
            console.table(schemaRes.rows);
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

debugPosts();
