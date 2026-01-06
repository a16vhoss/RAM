import db from '../lib/db.js';

// Insert sample providers into Supabase
const sampleProviders = [
    {
        business_name: 'Clínica Veterinaria Patitas',
        provider_type: 'Veterinario',
        email: 'contacto@patitas.com',
        phone: '33-1234-5678',
        address: 'Av. Chapultepec Norte 120, Col. Americana',
        city: 'Guadalajara',
        state: 'Jalisco',
        postal_code: '44160',
        latitude: 20.6756,
        longitude: -103.3625,
        description: 'Clínica veterinaria integral con servicios de emergencia 24/7',
        services: 'Consultas generales, Cirugía, Hospitalización, Rayos X',
        rating_average: 4.8,
        total_reviews: 245,
        is_verified: true
    },
    {
        business_name: 'Veterinaria San Francisco',
        provider_type: 'Veterinario',
        email: 'info@vetsanfran.com',
        phone: '33-2345-6789',
        address: 'Av. Niños Héroes 2903, Col. Jardines del Bosque',
        city: 'Guadalajara',
        state: 'Jalisco',
        postal_code: '44520',
        latitude: 20.6850,
        longitude: -103.3881,
        description: 'Especialistas en medicina preventiva y nutrición',
        services: 'Vacunación, Desparasitación, Consultas',
        rating_average: 4.5,
        total_reviews: 182,
        is_verified: true
    },
    {
        business_name: 'Hospital Veterinario Americas',
        provider_type: 'Veterinario',
        email: 'urgencias@vetamericas.com',
        phone: '33-3456-7890',
        address: 'Av. Américas 1506, Col. Providencia',
        city: 'Guadalajara',
        state: 'Jalisco',
        postal_code: '44630',
        latitude: 20.6717,
        longitude: -103.3827,
        description: 'Hospital de especialidades con equipo de alta tecnología',
        services: 'Emergencias 24h, Cirugía especializada, Imagenología',
        rating_average: 4.9,
        total_reviews: 387,
        is_verified: true
    },
    {
        business_name: 'Estética Canina Pelitos',
        provider_type: 'Estética',
        email: 'citas@pelitos.com',
        phone: '33-4567-8901',
        address: 'Av. Vallarta 2880, Col. Arcos Vallarta',
        city: 'Guadalajara',
        state: 'Jalisco',
        postal_code: '44130',
        latitude: 20.6892,
        longitude: -103.3768,
        description: 'Estética y spa para mascotas',
        services: 'Baño, Corte, Spa, Tintes',
        rating_average: 4.6,
        total_reviews: 156,
        is_verified: false
    },
    {
        business_name: 'Veterinaria Zapopan Centro',
        provider_type: 'Veterinario',
        email: 'contacto@vetzapopan.com',
        phone: '33-5678-9012',
        address: 'Av. Hidalgo 240, Centro Zapopan',
        city: 'Zapopan',
        state: 'Jalisco',
        postal_code: '45100',
        latitude: 20.7214,
        longitude: -103.3926,
        description: 'Atención veterinaria familiar desde 1985',
        services: 'Consultas, Vacunas, Esterilizaciones',
        rating_average: 4.7,
        total_reviews: 298,
        is_verified: true
    },
    {
        business_name: 'Veterinaria Polanco',
        provider_type: 'Veterinario',
        email: 'info@vetpolanco.com',
        phone: '55-1234-5678',
        address: 'Av. Ejército Nacional 843, Polanco',
        city: 'Ciudad de México',
        state: 'CDMX',
        postal_code: '11560',
        latitude: 19.4326,
        longitude: -99.1982,
        description: 'Clínica veterinaria de alta especialidad',
        services: 'Consultas, Cirugía, Diagnóstico',
        rating_average: 4.7,
        total_reviews: 312,
        is_verified: true
    }
];

async function insertProviders() {
    for (const provider of sampleProviders) {
        try {
            await db.run(`
                INSERT INTO providers (
                    business_name, provider_type, email, phone, address, city, state, postal_code,
                    latitude, longitude, description, services, rating_average, total_reviews, is_verified
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            `, [
                provider.business_name, provider.provider_type, provider.email, provider.phone,
                provider.address, provider.city, provider.state, provider.postal_code,
                provider.latitude, provider.longitude, provider.description, provider.services,
                provider.rating_average, provider.total_reviews, provider.is_verified
            ]);
            console.log(`✅ Inserted: ${provider.business_name}`);
        } catch (error) {
            console.error(`❌ Error inserting ${provider.business_name}:`, error);
        }
    }
    console.log('\\n✨ Sample providers setup complete!');
    process.exit(0);
}

insertProviders().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
