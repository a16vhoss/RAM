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
            SELECT 
                d.unique_registration_number,
                d.document_type,
                p.pet_id, p.pet_name, p.sex, p.birth_date, p.breed, p.color, p.city,
                p.father_breed, p.mother_breed,
                u.first_name, u.last_name, u.email, u.phone, u.city as user_city,
                u.detected_zone
            FROM documents d
            JOIN pets p ON d.pet_id = p.pet_id
            JOIN users u ON p.user_id = u.user_id
            WHERE d.unique_registration_number LIKE '%0266640%'
            OR p.pet_name ILIKE '%Bolt%'
            ORDER BY d.issued_at DESC
            LIMIT 5
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
