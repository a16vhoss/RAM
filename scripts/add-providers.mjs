import Database from 'better-sqlite3';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const dbPath = path.join(process.cwd(), 'ram.db');
const db = new Database(dbPath);

const providers = [
    {
        business_name: 'Veterinaria del Norte',
        provider_type: 'Veterinario',
        email: 'contacto@vetnorte.com',
        phone: '+52 33 1234 5678',
        address: 'Av. Vallarta 3456',
        city: 'Guadalajara',
        state: 'Jalisco',
        postal_code: '44100',
        latitude: 20.6736,
        longitude: -103.3622,
        description: 'Clínica veterinaria con más de 15 años de experiencia. Contamos con quirófano equipado y servicio de urgencias.',
        services: JSON.stringify(['Consultas', 'Cirugía', 'Vacunación', 'Hospitalización', 'Urgencias 24h']),
        specialties: JSON.stringify(['Cirugía', 'Medicina Interna', 'Dermatología']),
        schedule: JSON.stringify({
            Lunes: '9:00 - 20:00',
            Martes: '9:00 - 20:00',
            Miércoles: '9:00 - 20:00',
            Jueves: '9:00 - 20:00',
            Viernes: '9:00 - 20:00',
            Sábado: '9:00 - 14:00',
            Domingo: 'Cerrado'
        }),
        rating_average: 4.7,
        total_reviews: 89,
        is_premium: 1,
        is_verified: 1,
        status: 'Activo'
    },
    {
        business_name: 'Hospital Veterinario Central',
        provider_type: 'Clínica 24h',
        email: 'info@vetcentral.mx',
        phone: '+52 33 8765 4321',
        address: 'Av. Américas 1850',
        city: 'Guadalajara',
        state: 'Jalisco',
        postal_code: '44630',
        latitude: 20.6769,
        longitude: -103.3706,
        description: 'Hospital veterinario con atención 24/7. Especialistas en casos complejos y de urgencia.',
        services: JSON.stringify(['Urgencias', 'Cirugía', 'Laboratorio', 'Rayos X', 'Ultrasonido', 'Internamiento']),
        specialties: JSON.stringify(['Emergencias', 'Traumatología', 'Cardiología']),
        schedule: JSON.stringify({
            Lunes: '24 horas',
            Martes: '24 horas',
            Miércoles: '24 horas',
            Jueves: '24 horas',
            Viernes: '24 horas',
            Sábado: '24 horas',
            Domingo: '24 horas'
        }),
        rating_average: 4.9,
        total_reviews: 156,
        is_premium: 1,
        is_verified: 1,
        status: 'Activo'
    },
    {
        business_name: 'Estética Canina Peluditos',
        provider_type: 'Estética',
        email: 'peluditos@gmail.com',
        phone: '+52 33 5555 6789',
        address: 'Calle Independencia 234',
        city: 'Guadalajara',
        state: 'Jalisco',
        postal_code: '44100',
        latitude: 20.6767,
        longitude: -103.3475,
        description: 'Estética especializada en el cuidado y belleza de tu mascota. Baño, corte y spa.',
        services: JSON.stringify(['Baño', 'Corte', 'Spa', 'Limpieza dental', 'Desparasitación']),
        specialties: JSON.stringify(['Grooming', 'Estética canina']),
        schedule: JSON.stringify({
            Lunes: '10:00 - 19:00',
            Martes: '10:00 - 19:00',
            Miércoles: '10:00 - 19:00',
            Jueves: '10:00 - 19:00',
            Viernes: '10:00 - 19:00',
            Sábado: '10:00 - 15:00',
            Domingo: 'Cerrado'
        }),
        rating_average: 4.5,
        total_reviews: 42,
        is_premium: 0,
        is_verified: 1,
        status: 'Activo'
    },
    {
        business_name: 'Veterinaria Chapalita',
        provider_type: 'Veterinario',
        email: 'vet@chapalita.com',
        phone: '+52 33 3333 4444',
        address: 'Av. Tepeyac 4567',
        city: 'Guadalajara',
        state: 'Jalisco',
        postal_code: '45040',
        latitude: 20.6519,
        longitude: -103.4053,
        description: 'Veterinaria de confianza en Chapalita. Atención personalizada y profesional.',
        services: JSON.stringify(['Consultas', 'Vacunación', 'Desparasitación', 'Análisis clínicos']),
        specialties: JSON.stringify(['Medicina preventiva', 'Nutrición']),
        schedule: JSON.stringify({
            Lunes: '9:00 - 18:00',
            Martes: '9:00 - 18:00',
            Miércoles: '9:00 - 18:00',
            Jueves: '9:00 - 18:00',
            Viernes: '9:00 - 18:00',
            Sábado: '9:00 - 13:00',
            Domingo: 'Cerrado'
        }),
        rating_average: 4.6,
        total_reviews: 67,
        is_premium: 0,
        is_verified: 1,
        status: 'Activo'
    },
    {
        business_name: 'Refugio Animales Zapopan',
        provider_type: 'Refugio',
        email: 'refugio@zapopan.org',
        phone: '+52 33 2222 3333',
        address: 'Calle Colón 890',
        city: 'Zapopan',
        state: 'Jalisco',
        postal_code: '45100',
        latitude: 20.7214,
        longitude: -103.3919,
        description: 'Refugio dedicado al rescate y adopción responsable. Más de 50 animalitos esperando un hogar.',
        services: JSON.stringify(['Adopción', 'Rescate', 'Esterilización', 'Donaciones']),
        specialties: JSON.stringify(['Adopción responsable', 'Rescate']),
        schedule: JSON.stringify({
            Lunes: '10:00 - 17:00',
            Martes: '10:00 - 17:00',
            Miércoles: '10:00 - 17:00',
            Jueves: '10:00 - 17:00',
            Viernes: '10:00 - 17:00',
            Sábado: '10:00 - 14:00',
            Domingo: '10:00 - 14:00'
        }),
        rating_average: 4.8,
        total_reviews: 38,
        is_premium: 0,
        is_verified: 1,
        status: 'Activo'
    }
];

// Get a provider user_id to use (or any user if no provider exists)
const userId = db.prepare("SELECT user_id FROM users WHERE email = 'vet@patitas.com' LIMIT 1").get()?.user_id
    || db.prepare("SELECT user_id FROM users LIMIT 1").get().user_id;

// Insert providers
const insertStmt = db.prepare(`
  INSERT INTO providers (
    provider_id, user_id, business_name, provider_type, email, phone, address, 
    city, state, postal_code, latitude, longitude, description, 
    services, specialties, schedule, rating_average, total_reviews, 
    is_premium, is_verified, status, created_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
`);

providers.forEach(provider => {
    insertStmt.run(
        uuidv4(),
        userId,
        provider.business_name,
        provider.provider_type,
        provider.email,
        provider.phone,
        provider.address,
        provider.city,
        provider.state,
        provider.postal_code,
        provider.latitude,
        provider.longitude,
        provider.description,
        provider.services,
        provider.specialties,
        provider.schedule,
        provider.rating_average,
        provider.total_reviews,
        provider.is_premium,
        provider.is_verified,
        provider.status
    );
});

console.log(`✅ Added ${providers.length} veterinary providers to the database`);

const count = db.prepare('SELECT COUNT(*) as count FROM providers WHERE status = "Activo"').get();
console.log(`📊 Total active providers: ${count.count}`);

db.close();
