const { Pool } = require('pg');
const path = require('path');
// Force load .env then .env.local with override
require('dotenv').config();
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local'), override: true });

async function checkCommunities(email) {
    if (!process.env.DATABASE_URL) {
        console.error('DATABASE_URL is missing!');
        process.exit(1);
    }
    console.log('DATABASE_URL loaded:', process.env.DATABASE_URL.substring(0, 15) + '...');

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log(`--- Checking User: ${email} ---`);
        const userRes = await pool.query('SELECT user_id, first_name FROM users WHERE email = $1', [email]);
        if (userRes.rows.length === 0) {
            console.error('User not found');
            return;
        }
        const user = userRes.rows[0];
        console.log(`User ID: ${user.user_id}`);

        console.log('\n--- Checking User Pets ---');
        const petsRes = await pool.query('SELECT pet_id, pet_name, species, breed FROM pets WHERE user_id = $1', [user.user_id]);
        console.table(petsRes.rows);

        console.log('\n--- Checking Communities Table ---');
        const communitiesRes = await pool.query('SELECT community_id, name, type, species, breed FROM communities');
        if (communitiesRes.rows.length === 0) {
            console.log('WARNING: No communities found in DB!');
        } else {
            console.log(`Found ${communitiesRes.rows.length} communities.`);
            console.table(communitiesRes.rows);
        }

        console.log('\n--- Checking User Memberships ---');
        const membershipRes = await pool.query(`
            SELECT c.name, cm.joined_at, cm.is_auto_joined 
            FROM community_members cm
            JOIN communities c ON cm.community_id = c.community_id
            WHERE cm.user_id = $1
        `, [user.user_id]);

        if (membershipRes.rows.length === 0) {
            console.log('User has NO community memberships.');
        } else {
            console.table(membershipRes.rows);
        }

        console.log('\n--- Attempting Auto-Join Logic Manually ---');
        // Simulate what autoJoinUserToCommunities does
        for (const pet of petsRes.rows) {
            console.log(`Checking for pet: ${pet.pet_name} (${pet.species})`);

            // Check species community
            const speciesRes = await pool.query("SELECT community_id, name FROM communities WHERE type = 'species' AND species = $1", [pet.species]);
            if (speciesRes.rows.length > 0) {
                const comm = speciesRes.rows[0];
                console.log(`  MATCH: Found species community: ${comm.name}. Joining...`);
                await pool.query(`
                    INSERT INTO community_members (community_id, user_id, is_auto_joined)
                    VALUES ($1, $2, true)
                    ON CONFLICT (community_id, user_id) DO NOTHING
                `, [comm.community_id, user.user_id]);
                console.log('    -> Joined successfully.');
            } else {
                console.log(`  FAIL: No species community found for '${pet.species}'`);
            }

            // JOIN BREED COMMUNITY (If matched function exists, or do simple logic)
            // For now, let's just do species to fix the main issue.
            // But if we want breed, we need the stored procedure call or JS logic.
            // Let's rely on species first.

        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

checkCommunities('andreevillehoss@gmail.com');
