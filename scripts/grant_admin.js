const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

async function grantAdmin(email) {
    require('dotenv').config();
    require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local'), override: true });

    console.log('Environment keys:', Object.keys(process.env).filter(k => k.includes('DB') || k.includes('DATABASE')));

    if (!process.env.DATABASE_URL) {
        console.error('DATABASE_URL not found in environment');
        process.exit(1);
    }

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false } // Assuming cloud DB requiring SSL
    });

    try {
        console.log(`Searching for user with email: ${email}`);

        // Check if user exists
        const checkRes = await pool.query('SELECT user_id, email, role FROM users WHERE email = $1', [email]);

        if (checkRes.rows.length === 0) {
            console.error('User not found!');
            process.exit(1);
        }

        const user = checkRes.rows[0];
        console.log(`Found user: ${user.user_id} (${user.email}). Current role: ${user.role}`);

        if (user.role === 'admin') {
            console.log('User is already an admin.');
        } else {
            console.log('Updating role to ADMIN...');
            await pool.query('UPDATE users SET role = $1 WHERE user_id = $2', ['admin', user.user_id]);
            console.log('Success! User granted admin privileges.');
        }

    } catch (err) {
        console.error('Error granting admin:', err);
    } finally {
        await pool.end();
    }
}

// Get email from command line arg or use default
const email = process.argv[2] || 'andreevillehoss@gmail.com';
grantAdmin(email);
