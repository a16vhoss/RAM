import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
if (!process.env.DATABASE_URL) {
    dotenv.config({ path: path.resolve(process.cwd(), '.env') });
}

const { Pool } = pg;

async function debugData() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    });

    try {
        // Get the most recent pet named "Bolt"
        const petResult = await pool.query(`
            SELECT pet_id, pet_name, sex, species, breed, color, birth_date, city, father_breed, mother_breed, user_id
            FROM pets 
            WHERE pet_name ILIKE '%Bolt%'
            ORDER BY created_at DESC
            LIMIT 1
        `);

        console.log('\n=== PET DATA ===');
        if (petResult.rows.length > 0) {
            const pet = petResult.rows[0];
            console.log(JSON.stringify(pet, null, 2));
            console.log(`\nSex value: "${pet.sex}" (type: ${typeof pet.sex})`);
            console.log(`Sex === 'Macho': ${pet.sex === 'Macho'}`);
            console.log(`Sex === 'macho': ${pet.sex === 'macho'}`);

            // Get the owner data - using SELECT * to see all columns
            const userResult = await pool.query(`
                SELECT * FROM users WHERE user_id = $1
            `, [pet.user_id]);

            console.log('\n=== OWNER DATA ===');
            if (userResult.rows.length > 0) {
                console.log(JSON.stringify(userResult.rows[0], null, 2));
            } else {
                console.log('No user found with that user_id');
            }
        } else {
            console.log('No pet named Bolt found');
        }

        // Also check users table structure
        const columnsResult = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users'
            ORDER BY ordinal_position
        `);
        console.log('\n=== USERS TABLE COLUMNS ===');
        console.log(columnsResult.rows.map(r => r.column_name).join(', '));

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

debugData();
