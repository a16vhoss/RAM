const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function seed() {
    try {
        console.log('Seeding Data...');

        // 1. Seed User
        const email = 'demo@ui.com';
        const password = 'password';
        const hashedPassword = await bcrypt.hash(password, 10);

        // Check if user exists
        let userRes = await pool.query('SELECT user_id FROM users WHERE email = $1', [email]);
        let userId;

        if (userRes.rows.length === 0) {
            const insertRes = await pool.query(
                `INSERT INTO users (full_name, email, password_hash, created_at) 
             VALUES ($1, $2, $3, NOW()) RETURNING user_id`,
                ['Demo UI', email, hashedPassword]
            );
            userId = insertRes.rows[0].user_id;
            console.log(`Created User: ${email}`);
        } else {
            userId = userRes.rows[0].user_id;
            console.log(`User exists: ${email}`);
        }

        // 2. Seed Pet
        const petName = 'Max';
        const petRes = await pool.query('SELECT pet_id FROM pets WHERE owner_id = $1 AND pet_name = $2', [userId, petName]);

        if (petRes.rows.length === 0) {
            await pool.query(
                `INSERT INTO pets (
                owner_id, pet_name, species, breed, birth_date, weight, sex, color, 
                pet_photo, created_at
            ) VALUES ($1, $2, 'Perro', 'Golden Retriever', '2020-05-12', 28.5, 'Macho', 'Dorado', 
              'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=1000', NOW())`,
                [userId, petName]
            );
            console.log(`Created Pet: ${petName}`);
        } else {
            console.log(`Pet exists: ${petName}`);
        }

        // 3. Seed Providers
        constproviders = [
            {
                business_name: 'Hospital Veterinario Roma',
                provider_type: 'Veterinario',
                description: 'Especialistas en cirugía y cuidados intensivos. Abierto 24 horas.',
                phone: '555-123-4567',
                email: 'contacto@vetroma.mx',
                website: 'https://vetroma.mx',
                address: 'Av. Álvaro Obregón 150',
                city: 'Ciudad de México',
                state: 'CDMX',
                zip_code: '06700',
                latitude: 19.415,
                longitude: -99.160,
                rating_average: 4.9,
                total_reviews: 120,
                is_premium: true,
                status: 'Activo',
                services: ['Cirugía', 'Rayos X', 'Urgencias'],
                verified: true
            },
            {
                business_name: 'PetEstética Polanco',
                provider_type: 'Estética',
                description: 'Spa y estilismo canino de lujo. Baños medicados y corte profesional.',
                phone: '555-987-6543',
                email: 'citas@petpolanco.mx',
                website: 'https://petpolanco.mx',
                address: 'Masaryk 300',
                city: 'Ciudad de México',
                state: 'CDMX',
                zip_code: '11550',
                latitude: 19.430,
                longitude: -99.190,
                rating_average: 4.7,
                total_reviews: 85,
                is_premium: false,
                status: 'Activo',
                services: ['Baño', 'Corte', 'Spa'],
                verified: true
            }
        ];

        for (const p of constproviders) {
            const res = await pool.query('SELECT provider_id FROM providers WHERE business_name = $1', [p.business_name]);
            if (res.rows.length === 0) {
                await pool.query(
                    `INSERT INTO providers (
                business_name, provider_type, description, phone, email, website, 
                address, city, state, zip_code, latitude, longitude, 
                rating_average, total_reviews, is_premium, status, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW())`,
                    [
                        p.business_name, p.provider_type, p.description, p.phone, p.email, p.website,
                        p.address, p.city, p.state, p.zip_code, p.latitude, p.longitude,
                        p.rating_average, p.total_reviews, p.is_premium, p.status
                    ]
                );
                console.log(`Inserted Provider: ${p.business_name}`);
            }
        }

        console.log('Seeding complete.');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding:', err);
        process.exit(1);
    }
}

seed();
