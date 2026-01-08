CREATE TABLE IF NOT EXISTS medical_records (
    record_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    pet_id TEXT REFERENCES pets(pet_id) ON DELETE CASCADE,
    record_type VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    vet_name VARCHAR(100),
    description TEXT,
    attachments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
