import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
if (!process.env.DATABASE_URL) {
    dotenv.config({ path: path.resolve(process.cwd(), '.env') });
}

const { Pool } = pg;

async function debugDocuments() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    });

    try {
        // Simulate EXACTLY what documents/page.js does
        const result = await pool.query(`
            SELECT 
                d.*, 
                p.pet_name, 
                p.pet_photo,
                p.breed,
                p.color,
                p.sex,
                p.birth_date,
                p.medical_notes,
                p.city as pet_city,
                p.father_breed,
                p.mother_breed,
                u.first_name as owner_first_name,
                u.last_name as owner_last_name,
                u.email as owner_email,
                u.phone as owner_phone,
                u.city as owner_city,
                u.address as owner_address,
                u.detected_zone as owner_location
            FROM documents d 
            JOIN pets p ON d.pet_id = p.pet_id 
            JOIN users u ON p.user_id = u.user_id
            WHERE p.pet_name ILIKE '%Bolt%'
            ORDER BY d.issued_at DESC
        `);

        console.log('\n=== DOCUMENTS QUERY RESULT (same as page.js) ===');
        console.log(`Found ${result.rows.length} documents for Bolt\n`);

        result.rows.forEach((doc, i) => {
            console.log(`--- Document ${i + 1} ---`);
            console.log(`  Registration: ${doc.unique_registration_number}`);
            console.log(`  Type: ${doc.document_type}`);
            console.log(`  Pet Name: ${doc.pet_name}`);
            console.log(`  Sex: "${doc.sex}" (type: ${typeof doc.sex})`);
            console.log(`  Birth Date: ${doc.birth_date}`);
            console.log(`  Owner: ${doc.owner_first_name} ${doc.owner_last_name}`);
            console.log(`  Email: ${doc.owner_email}`);
            console.log(`  Phone: ${doc.owner_phone}`);
            console.log(`  Location: ${doc.owner_location}`);
            console.log(`  City: ${doc.owner_city}`);
            console.log('');
        });

        // Also check if there are ANY errors with the query itself
        console.log('=== FULL RAW DATA ===');
        console.log(JSON.stringify(result.rows[0], null, 2));

    } catch (error) {
        console.error('ERROR executing query:', error.message);
        console.error('Full error:', error);
    } finally {
        await pool.end();
    }
}

debugDocuments();
