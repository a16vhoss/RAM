-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    user_id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    role TEXT DEFAULT 'tutor', -- 'tutor', 'admin', 'provider'
    phone TEXT,
    city TEXT,
    country TEXT DEFAULT 'México',
    state TEXT,
    zip_code TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Pets Table (Matched to current app logic)
CREATE TABLE IF NOT EXISTS pets (
    pet_id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    pet_name TEXT NOT NULL,
    species TEXT, -- Perro, Gato, etc.
    breed TEXT,
    color TEXT,
    sex TEXT, -- 'Macho', 'Hembra' (Matches app logic)
    birth_date DATE,
    weight REAL,
    microchip_number TEXT, -- Matched app logic
    medical_notes TEXT,
    allergies TEXT,
    spayed_neutered BOOLEAN DEFAULT FALSE, -- Matched app logic
    pet_photo TEXT, -- Matched app logic
    status TEXT DEFAULT 'Activo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Documents Table
CREATE TABLE IF NOT EXISTS documents (
    document_id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    pet_id TEXT NOT NULL REFERENCES pets(pet_id) ON DELETE CASCADE,
    user_id TEXT REFERENCES users(user_id), -- Added request by app logic
    document_type TEXT NOT NULL, -- Acta de Propiedad, Credencial, Cartilla
    unique_registration_number TEXT,
    pdf_url TEXT, -- Renamed from file_url to match some app logic if needed, or keep helpful alias
    file_url TEXT, -- Keeping both or just one? App uses pdf_url in create route?
    -- app/api/pets/create/route.js uses: unique_registration_number, pdf_url
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Providers Table (Veterinarians, etc.)
CREATE TABLE IF NOT EXISTS providers (
    provider_id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT REFERENCES users(user_id),
    business_name TEXT NOT NULL,
    provider_type TEXT, -- Veterinario, Estética, Paseador, Refugio
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    latitude REAL,
    longitude REAL,
    description TEXT,
    services TEXT, 
    specialties TEXT, 
    schedule TEXT, 
    rating_average REAL DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    is_premium BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'Activo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Blog Posts Table
CREATE TABLE IF NOT EXISTS blog_posts (
    post_id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    excerpt TEXT,
    content TEXT,
    author_name TEXT,
    image_url TEXT,
    tags TEXT,
    views_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'Publicado',
    published_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert Sample Blog Posts
INSERT INTO blog_posts (slug, title, excerpt, content, author_name, tags) VALUES 
('cuidados-cachorro', 'Cuidados esenciales para tu nuevo cachorro', 'Descubre todo lo que necesitas saber para recibir a tu nuevo mejor amigo en casa.', '<p>Contenido del artículo sobre cachorros...</p>', 'Dra. Ana García', '["Cachorros", "Salud", "Tips"]'),
('importancia-vacunacion', '¿Por qué es vital vacunar a tus mascotas?', 'Las vacunas salvan vidas. Conoce el calendario de vacunación recomendado.', '<p>Contenido sobre vacunación...</p>', 'Dr. Carlos Ruiz', '["Salud", "Vacunas", "Prevención"]');
