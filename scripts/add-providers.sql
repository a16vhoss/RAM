-- Add more veterinarians to the directory
-- Get a user_id to associate with providers
WITH provider_user AS (
  SELECT user_id FROM users WHERE email = 'vet@patitas.com' LIMIT 1
)
INSERT INTO providers (provider_id, user_id, business_name, provider_type, email, phone, address, city, state, postal_code, latitude, longitude, description, services, specialties, schedule, rating_average, total_reviews, is_premium, is_verified, status)
SELECT 
  lower(hex(randomblob(16))),
  (SELECT user_id FROM provider_user),
  business_name,
  provider_type,
  email,
  phone,
  address,
  city,
  state,
  postal_code,
  latitude,
  longitude,
  description,
  services,
  specialties,
  schedule,
  rating_average,
  total_reviews,
  is_premium,
  is_verified,
  status
FROM (
  SELECT 'Veterinaria del Norte' as business_name, 'Veterinario' as provider_type, 'contacto@vetnorte.com' as email, '+52 33 1234 5678' as phone, 'Av. Vallarta 3456' as address, 'Guadalajara' as city, 'Jalisco' as state, '44100' as postal_code, 20.6736 as latitude, -103.3622 as longitude, 'Clínica veterinaria con más de 15 años de experiencia. Contamos con quirófano equipado y servicio de urgencias.' as description, '["Consultas", "Cirugía", "Vacunación", "Hospitalización", "Urgencias 24h"]' as services, '["Cirugía", "Medicina Interna", "Dermatología"]' as specialties, '{"Lunes": "9:00 - 20:00", "Martes": "9:00 - 20:00", "Miércoles": "9:00 - 20:00", "Jueves": "9:00 - 20:00", "Viernes": "9:00 - 20:00", "Sábado": "9:00 - 14:00", "Domingo": "Cerrado"}' as schedule, 4.7 as rating_average, 89 as total_reviews, 1 as is_premium, 1 as is_verified, 'Activo' as status
  UNION ALL
  SELECT 'Hospital Veterinario Central', 'Clínica 24h', 'info@vetcentral.mx', '+52 33 8765 4321', 'Av. Américas 1850', 'Guadalajara', 'Jalisco', '44630', 20.6769, -103.3706, 'Hospital veterinario con atención 24/7. Especialistas en casos complejos y de urgencia.', '["Urgencias", "Cirugía", "Laboratorio", "Rayos X", "Ultrasonido", "Internamiento"]', '["Emergencias", "Traumatología", "Cardiología"]', '{"Lunes": "24 horas", "Martes": "24 horas", "Miércoles": "24 horas", "Jueves": "24 horas", "Viernes": "24 horas", "Sábado": "24 horas", "Domingo": "24 horas"}', 4.9, 156, 1, 1, 'Activo'
  UNION ALL
  SELECT 'Estética Canina Peluditos', 'Estética', 'peluditos@gmail.com', '+52 33 5555 6789', 'Calle Independencia 234', 'Guadalajara', 'Jalisco', '44100', 20.6767, -103.3475, 'Estética especializada en el cuidado y belleza de tu mascota. Baño, corte y spa.', '["Baño", "Corte", "Spa", "Limpieza dental", "Desparasitación"]', '["Grooming", "Estética canina"]', '{"Lunes": "10:00 - 19:00", "Martes": "10:00 - 19:00", "Miércoles": "10:00 - 19:00", "Jueves": "10:00 - 19:00", "Viernes": "10:00 - 19:00", "Sábado": "10:00 - 15:00", "Domingo": "Cerrado"}', 4.5, 42, 0, 1, 'Activo'
  UNION ALL
  SELECT 'Veterinaria Chapalita', 'Veterinario', 'vet@chapalita.com', '+52 33 3333 4444', 'Av. Tepeyac 4567', 'Guadalajara', 'Jalisco', '45040', 20.6519, -103.4053, 'Veterinaria de confianza en Chapalita. Atención personalizada y profesional.', '["Consultas", "Vacunación", "Desparasitación", "Análisis clínicos"]', '["Medicina preventiva", "Nutrición"]', '{"Lunes": "9:00 - 18:00", "Martes": "9:00 - 18:00", "Miércoles": "9:00 - 18:00", "Jueves": "9:00 - 18:00", "Viernes": "9:00 - 18:00", "Sábado": "9:00 - 13:00", "Domingo": "Cerrado"}', 4.6, 67, 0, 1, 'Activo'
  UNION ALL
  SELECT 'Refugio Animales Zapopan', 'Refugio', 'refugio@zapopan.org', '+52 33 2222 3333', 'Calle Colón 890', 'Zapopan', 'Jalisco', '45100', 20.7214, -103.3919, 'Refugio dedicado al rescate y adopción responsable. Más de 50 animalitos esperando un hogar.', '["Adopción", "Rescate", "Esterilización", "Donaciones"]', '["Adopción responsable", "Rescate"]', '{"Lunes": "10:00 - 17:00", "Martes": "10:00 - 17:00", "Miércoles": "10:00 - 17:00", "Jueves": "10:00 - 17:00", "Viernes": "10:00 - 17:00", "Sábado": "10:00 - 14:00", "Domingo": "10:00 - 14:00"}', 4.8, 38, 0, 1, 'Activo'
);
