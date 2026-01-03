import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// DB at root
const dbPath = path.join(__dirname, '../ram.db');
const db = new Database(dbPath);

console.log(`Seeding database at ${dbPath}...`);

// 1. Create Tables
const schema = `
  -- Users
  CREATE TABLE IF NOT EXISTS users (
    user_id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    role TEXT CHECK(role IN ('tutor', 'provider', 'admin')) DEFAULT 'tutor',
    phone TEXT,
    city TEXT,
    country TEXT DEFAULT 'México',
    state TEXT,
    zip_code TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Pets
  CREATE TABLE IF NOT EXISTS pets (
    pet_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    pet_name TEXT NOT NULL,
    species TEXT NOT NULL,
    breed TEXT,
    color TEXT,
    sex TEXT,
    birth_date DATE,
    weight REAL,
    microchip_number TEXT,
    pet_photo TEXT,
    medical_notes TEXT,
    allergies TEXT,
    spayed_neutered BOOLEAN DEFAULT 0,
    status TEXT DEFAULT 'Activo',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(user_id)
  );

  -- Documents
  CREATE TABLE IF NOT EXISTS documents (
    document_id TEXT PRIMARY KEY,
    pet_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    document_type TEXT,
    unique_registration_number TEXT,
    qr_code_url TEXT,
    pdf_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT 1,
    FOREIGN KEY(pet_id) REFERENCES pets(pet_id),
    FOREIGN KEY(user_id) REFERENCES users(user_id)
  );

  -- Providers
  CREATE TABLE IF NOT EXISTS providers (
    provider_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    business_name TEXT NOT NULL,
    provider_type TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    latitude REAL,
    longitude REAL,
    phone TEXT,
    email TEXT,
    website TEXT,
    description TEXT,
    specialties TEXT, -- JSON array
    services TEXT, -- JSON array
    schedule TEXT, -- JSON
    price_range TEXT,
    payment_methods TEXT, -- JSON array
    logo_url TEXT,
    photos TEXT, -- JSON array
    certifications TEXT, -- JSON array
    is_verified BOOLEAN DEFAULT 0,
    is_premium BOOLEAN DEFAULT 0,
    rating_average REAL DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    total_appointments INTEGER DEFAULT 0,
    status TEXT DEFAULT 'Activo',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(user_id)
  );

  -- Blog Posts
  CREATE TABLE IF NOT EXISTS blog_posts (
    post_id TEXT PRIMARY KEY,
    author_id TEXT NOT NULL,
    title TEXT NOT NULL,
    slug TEXT UNIQUE,
    excerpt TEXT,
    content TEXT,
    featured_image TEXT,
    category TEXT,
    tags TEXT, -- JSON array
    status TEXT DEFAULT 'Publicado',
    views_count INTEGER DEFAULT 0,
    published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(author_id) REFERENCES users(user_id)
  );
`;

db.exec(schema);
console.log("Tables created.");

// 2. Seed Data

// Helper: Hash password
const hash = (pwd) => bcrypt.hashSync(pwd, 10);

// Users
const adminId = uuidv4();
const tutorId = uuidv4();
const providerId = uuidv4();

const users = [
    {
        user_id: adminId,
        email: 'admin@ram.com',
        password_hash: hash('Admin123!'),
        first_name: 'Admin',
        last_name: 'System',
        role: 'admin',
        phone: null,
        city: 'CDMX',
        state: 'CDMX'
    },
    {
        user_id: tutorId,
        email: 'tutor@test.com',
        password_hash: hash('Tutor123!'),
        first_name: 'Luis',
        last_name: 'García',
        role: 'tutor',
        phone: '+52 33 3569 3333',
        city: 'Guadalajara',
        state: 'Jalisco'
    },
    {
        user_id: providerId,
        email: 'vet@patitas.com',
        password_hash: hash('Vet123!'),
        first_name: 'Juan',
        last_name: 'Veterinario',
        role: 'provider',
        phone: '3331234567',
        city: 'Guadalajara',
        state: 'Jalisco'
    }
];

const insertUser = db.prepare(`
  INSERT OR IGNORE INTO users (user_id, email, password_hash, first_name, last_name, role, phone, city, state)
  VALUES (@user_id, @email, @password_hash, @first_name, @last_name, @role, @phone, @city, @state)
`);

users.forEach(u => insertUser.run(u));
console.log("Users seeded.");

// Pets (for Tutor)
const petId = uuidv4();
const pet = {
    pet_id: petId,
    user_id: tutorId,
    pet_name: 'Ruffo',
    species: 'Perro',
    breed: 'Labrador',
    color: 'Miel',
    sex: 'Macho',
    birth_date: '2019-07-01',
    weight: 28.5,
    pet_photo: '/placeholder-pet.jpg', // We will need a placeholder
    status: 'Activo'
};

const insertPet = db.prepare(`
  INSERT OR IGNORE INTO pets (pet_id, user_id, pet_name, species, breed, color, sex, birth_date, weight, pet_photo, status)
  VALUES (@pet_id, @user_id, @pet_name, @species, @breed, @color, @sex, @birth_date, @weight, @pet_photo, @status)
`);
insertPet.run(pet);
console.log("Pets seeded.");

// Provider Details
const providerDetails = {
    provider_id: uuidv4(),
    user_id: providerId,
    business_name: 'Clínica Veterinaria Patitas',
    provider_type: 'Veterinario',
    address: 'Av. Vallarta 1234',
    city: 'Guadalajara',
    state: 'Jalisco',
    postal_code: '44100',
    latitude: 20.6736,
    longitude: -103.344,
    phone: '3331234567',
    email: 'contacto@patitas.com',
    description: 'Clínica veterinaria con atención 24 horas y especialidad en cirugía.',
    specialties: JSON.stringify(['Cirugía', 'Urgencias', 'Vacunación']),
    services: JSON.stringify(['Consulta', 'Rayos X', 'Laboratorio']),
    schedule: JSON.stringify({ lunes: "9-18", martes: "9-18" }),
    price_range: '$$',
    is_verified: 1,
    is_premium: 1,
    rating_average: 4.8,
    total_reviews: 127
};

const insertProvider = db.prepare(`
  INSERT OR IGNORE INTO providers (provider_id, user_id, business_name, provider_type, address, city, state, postal_code, latitude, longitude, phone, email, description, specialties, services, schedule, price_range, is_verified, is_premium, rating_average, total_reviews)
  VALUES (@provider_id, @user_id, @business_name, @provider_type, @address, @city, @state, @postal_code, @latitude, @longitude, @phone, @email, @description, @specialties, @services, @schedule, @price_range, @is_verified, @is_premium, @rating_average, @total_reviews)
`);
insertProvider.run(providerDetails);
console.log("Providers seeded.");

// Blog Posts
const post = {
    post_id: uuidv4(),
    author_id: adminId,
    title: 'Qué hacer si tu perro se pierde',
    slug: 'que-hacer-si-tu-perro-se-pierde',
    excerpt: 'Una guía completa de los primeros pasos a seguir.',
    content: '<p>Mantén la calma y sigue estos pasos...</p>',
    category: 'Extravíos y Rescates',
    status: 'Publicado',
    views_count: 1200
};

const insertPost = db.prepare(`
  INSERT OR IGNORE INTO blog_posts (post_id, author_id, title, slug, excerpt, content, category, status, views_count)
  VALUES (@post_id, @author_id, @title, @slug, @excerpt, @content, @category, @status, @views_count)
`);
insertPost.run(post);
console.log("Blog posts seeded.");

console.log("Database seeding completed!");
