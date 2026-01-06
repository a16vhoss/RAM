-- Insert Sample Provider Data for Testing Map Functionality

-- Veterinarias en Guadalajara y área metropolitana
INSERT INTO providers (business_name, provider_type, email, phone, address, city, state, postal_code, latitude, longitude, description, services, rating_average, total_reviews, is_verified) VALUES 
('Clínica Veterinaria Patitas', 'Veterinario', 'contacto@patitas.com', '33-1234-5678', 'Av. Chapultepec Norte 120, Col. Americana', 'Guadalajara', 'Jalisco', '44160', 20.6756, -103.3625, 'Clínica veterinaria integral con servicios de emergencia 24/7', 'Consultas generales, Cirugía, Hospitalización, Rayos X', 4.8, 245, TRUE),

('Veterinaria San Francisco', 'Veterinario', 'info@vetsanfran.com', '33-2345-6789', 'Av. Niños Héroes 2903, Col. Jardines del Bosque', 'Guadalajara', 'Jalisco', '44520', 20.6850, -103.3881, 'Especialistas en medicina preventiva y nutrición', 'Vacunación, Desparasitación, Consultas', 4.5, 182, TRUE),

('Hospital Veterinario Americas', 'Veterinario', 'urgencias@vetamericas.com', '33-3456-7890', 'Av. Américas 1506, Col. Providencia', 'Guadalajara', 'Jalisco', '44630', 20.6717, -103.3827, 'Hospital de especialidades con equipo de alta tecnología', 'Emergencias 24h, Cirugía especializada, Imagenología', 4.9, 387, TRUE),

('Estética Canina Pelitos', 'Estética', 'citas@pelitos.com', '33-4567-8901', 'Av. Vallarta 2880, Col. Arcos Vallarta', 'Guadalajara', 'Jalisco', '44130', 20.6892, -103.3768, 'Estética y spa para mascotas', 'Baño, Corte, Spa, Tintes', 4.6, 156, FALSE),

('Veterinaria Zapopan Centro', 'Veterinario', 'contacto@vetzapopan.com', '33-5678-9012', 'Av. Hidalgo 240, Centro Zapopan', 'Zapopan', 'Jalisco', '45100', 20.7214, -103.3926, 'Atención veterinaria familiar desde 1985', 'Consultas, Vacunas, Esterilizaciones', 4.7, 298, TRUE),

('Pet Shop y Veterinaria TuMascota', 'Tienda', 'ventas@tumascota.com', '33-6789-0123', 'Av. López Mateos Sur 2077, Col. Chapalita', 'Guadalajara', 'Jalisco', '45040', 20.6589, -103.4137, 'Tienda de mascotas con servicio veterinario', 'Alimentos, Accesorios, Consultas veterinarias', 4.4, 134, FALSE),

('Clínica Veterinaria del Bosque', 'Veterinario', 'info@vetbosque.com', '33-7890-1234', 'Av. La Paz 2405, Col. Arcos Sur', 'Guadalajara', 'Jalisco', '44140', 20.6732, -103.3699, 'Especialistas en medicina interna y dermatología', 'Dermatología, Cardiología, Endocrinología', 4.8, 203, TRUE),

('Urgencias Veterinarias 24h Guadalajara', 'Urgencias', 'emergencias@urgvet24.com', '33-8901-2345', 'Av. Patria 1891, Col. Puerta de Hierro', 'Zapopan', 'Jalisco', '45116', 20.6988, -103.4323, 'Servicio de urgencias veterinarias las 24 horas', 'Urgencias, Hospitalización, Cuidados intensivos', 4.9, 421, TRUE);

-- También en Ciudad de México para testing
INSERT INTO providers (business_name, provider_type, email, phone, address, city, state, postal_code, latitude, longitude, description, rating_average, total_reviews, is_verified) VALUES 
('Veterinaria Polanco', 'Veterinario', 'info@vetpolanco.com', '55-1234-5678', 'Av. Ejército Nacional 843, Polanco', 'Ciudad de México', 'CDMX', '11560', 19.4326, -99.1982, 'Clínica veterinaria de alta especialidad', 4.7, 312, TRUE);
