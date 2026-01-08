'use server';

import { createClient } from '@supabase/supabase-js';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import { revalidatePath } from 'next/cache';

// Initialize Supabase Client
// We use the Service Role Key if available for bypassing RLS, otherwise Anon Key
// Initialize Supabase Client dynamically to avoid top-level crashes
function getSupabaseClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error('Missing Supabase environment variables');
        return null;
    }
    return createClient(supabaseUrl, supabaseKey);
}
// const supabase = createClient(supabaseUrl, supabaseKey); // Removed top-level init

export async function createPet(formData) {
    console.log('Server Action createPet STARTED');
    let session;
    try {
        session = await getSession();
        console.log('Session retrieved:', session?.user?.email);
    } catch (e) {
        console.error('getSession failed:', e);
        return { success: false, error: 'Auth failed' };
    }
    if (!session || !session.user || !session.user.user_id) {
        console.error('Invalid session structure:', session);
        return { success: false, error: 'Sesión no válida o usuario no identificado' };
    }

    try {
        const petName = formData.get('petName');
        const species = formData.get('species');
        const breed = formData.get('breed');
        const color = formData.get('color');
        const sex = formData.get('sex');
        const birthDate = formData.get('birthDate');
        const weight = formData.get('weight');
        const microchipNumber = formData.get('microchipNumber');
        const isSpayed = formData.get('isSpayed') === 'true';
        const medicalNotes = formData.get('medicalNotes');
        const allergies = formData.get('allergies');
        const photoFile = formData.get('photo'); // File object

        if (!petName || !species) {
            return { success: false, error: 'Faltan campos obligatorios' };
        }

        let photoUrl = `/api/placeholder?name=${encodeURIComponent(petName)}`;

        // Handle File Upload
        // Handle File Upload
        if (photoFile && photoFile.size > 0) {
            const supabase = getSupabaseClient();
            if (!supabase) {
                return { success: false, error: 'Error crítico: No se pueden subir fotos porque faltan las credenciales de Supabase.' };
            }

            const fileExt = photoFile.name.split('.').pop();
            const fileName = `${uuidv4()}.${fileExt}`;
            const filePath = `${session.user.user_id}/${fileName}`;

            const { data, error: uploadError } = await supabase.storage
                .from('pet-photos')
                .upload(filePath, photoFile, {
                    contentType: photoFile.type,
                    upsert: false
                });

            if (uploadError) {
                console.error('Storage upload error:', uploadError);
                return { success: false, error: 'Falló la subida de imagen.' };
            }

            const { data: { publicUrl } } = supabase.storage
                .from('pet-photos')
                .getPublicUrl(filePath);
            photoUrl = publicUrl;
        }

        const petId = uuidv4();
        const userId = session.user.user_id;

        // Insert Pet
        await db.run(`
            INSERT INTO pets (
                pet_id, user_id, pet_name, species, breed, color, sex, 
                birth_date, weight, microchip_number, spayed_neutered, 
                medical_notes, allergies, pet_photo, status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        `, [
            petId, userId, petName, species, breed, color, sex,
            birthDate || null, weight || null, microchipNumber || null, isSpayed ? 1 : 0,
            medicalNotes || null, allergies || null, photoUrl, 'Activo'
        ]);

        // Add to pet_owners (Family Mode)
        await db.run(`
            INSERT INTO pet_owners (pet_id, user_id, role)
            VALUES ($1, $2, 'owner')
        `, [petId, userId]);

        // Auto-generate Document (Acta)
        // Auto-generate Documents
        const regNum = `RAM-${new Date().getFullYear().toString().slice(-1)}-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;

        // 1. Acta de Registro Animal
        const docId1 = uuidv4();
        await db.run(`
            INSERT INTO documents (document_id, pet_id, user_id, document_type, unique_registration_number, issued_at)
            VALUES ($1, $2, $3, $4, $5, NOW())
        `, [docId1, petId, userId, 'Acta de Registro Animal', regNum]);

        // 2. Credencial de Identificación
        const docId2 = uuidv4();
        await db.run(`
            INSERT INTO documents (document_id, pet_id, user_id, document_type, unique_registration_number, issued_at)
            VALUES ($1, $2, $3, $4, $5, NOW())
        `, [docId2, petId, userId, 'Credencial de Identificación', regNum]);

        revalidatePath('/dashboard');
        return { success: true, petId };

    } catch (error) {
        console.error('Create pet error:', error);
        return { success: false, error: error.message };
    }
}

export async function deletePet(petId) {
    console.log('Server Action deletePet STARTED');
    let session;
    try {
        session = await getSession();
    } catch (e) {
        return { success: false, error: 'Auth failed' };
    }

    if (!session || !session.user || !session.user.user_id) {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        // Verify ownership
        const [pet] = await db.getAll('SELECT user_id FROM pets WHERE pet_id = $1', [petId]);

        if (!pet) {
            return { success: false, error: 'Pet not found' };
        }

        if (pet.user_id !== session.user.user_id) {
            return { success: false, error: 'Unauthorized to delete this pet' };
        }

        // Delete associated documents first
        await db.run('DELETE FROM documents WHERE pet_id = $1', [petId]);

        // Delete pet
        await db.run('DELETE FROM pets WHERE pet_id = $1', [petId]);

        revalidatePath('/dashboard');
        revalidatePath(`/pets/${petId}`);
        return { success: true };

    } catch (error) {
        console.error('Delete pet error:', error);
        return { success: false, error: error.message };
    }
}

export async function toggleLostPetStatus(petId, isLost, location = null, radius = 5, message = '') {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    try {
        const newStatus = isLost ? 'lost' : 'active';
        const userId = session.user.user_id;

        // Update status and location if provided
        if (isLost && location) {
            await db.run(
                'UPDATE pets SET status = $1, last_latitude = $2, last_longitude = $3 WHERE pet_id = $4',
                [newStatus, location.lat, location.lng, petId]
            );

            // Find users nearby and create notifications
            // Using Haversine formula approximation in SQL
            // We verify distance in the WHERE clause directly
            const nearbyUsers = await db.getAll(`
                SELECT user_id, 
                   (6371 * acos(least(1.0, greatest(-1.0, cos(radians($1)) * cos(radians(last_latitude)) * cos(radians(last_longitude) - radians($2)) + sin(radians($1)) * sin(radians(last_latitude)))))) AS distance
                FROM users
                WHERE last_latitude IS NOT NULL 
                  AND last_longitude IS NOT NULL
                  AND user_id != $3
                  AND (6371 * acos(least(1.0, greatest(-1.0, cos(radians($1)) * cos(radians(last_latitude)) * cos(radians(last_longitude) - radians($2)) + sin(radians($1)) * sin(radians(last_latitude)))))) <= $4
            `, [location.lat, location.lng, userId, radius]);

            console.log(`Found ${nearbyUsers.length} users nearby to notify.`);

            // Insert notifications
            // We do this individually for now, could be bulk inserted for performance
            for (const user of nearbyUsers) {
                await db.run(`
                    INSERT INTO notifications (user_id, title, message, type, related_id)
                    VALUES ($1, $2, $3, $4, $5)
                `, [
                    user.user_id,
                    '🚨 ALERTA AMBER: Mascota Perdida Cerca',
                    message || 'Se ha reportado una mascota perdida en tu zona. ¡Ayúdanos a encontrarla!',
                    'amber_alert',
                    petId
                ]);
            }

        } else {
            // Just update status if found or no location provided
            await db.run('UPDATE pets SET status = $1 WHERE pet_id = $2', [newStatus, petId]);

            // Notify original recipients that the pet was found
            if (!isLost) { // Marking as found
                const originalRecipients = await db.getAll(`
                    SELECT DISTINCT user_id FROM notifications 
                    WHERE related_id = $1 AND type = 'amber_alert'
                `, [petId]);

                if (originalRecipients.length > 0) {
                    // Get Pet Name for the message
                    const [pet] = await db.getAll('SELECT pet_name FROM pets WHERE pet_id = $1', [petId]);
                    const petName = pet ? pet.pet_name : 'La mascota';

                    for (const recipient of originalRecipients) {
                        await db.run(`
                            INSERT INTO notifications (user_id, title, message, type, related_id)
                            VALUES ($1, $2, $3, $4, $5)
                        `, [
                            recipient.user_id,
                            '🎉 ¡Mascota Encontrada!',
                            `¡Buenas noticias! ${petName} ya está de vuelta en casa. Gracias por tu apoyo.`,
                            'pet_found',
                            petId
                        ]);
                    }
                    console.log(`Notified ${originalRecipients.length} users that pet was found.`);
                }
            }
        }

        revalidatePath(`/pets/${petId}`);
        revalidatePath('/dashboard');
        revalidatePath('/alertas');

        return { success: true, status: newStatus };
    } catch (error) {
        console.error('Error toggling lost status:', error);
        return { error: 'Failed to update status: ' + error.message };
    }
}

export async function updatePet(petId, formData) {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    try {
        const userId = session.user.user_id;

        // Verify ownership
        const [existingPet] = await db.getAll('SELECT user_id, pet_photo FROM pets WHERE pet_id = $1', [petId]);
        if (!existingPet) return { error: 'Pet not found' };
        if (existingPet.user_id !== userId) return { error: 'Unauthorized' };

        const petName = formData.get('petName');
        const species = formData.get('species');
        const breed = formData.get('breed');
        const color = formData.get('color');
        const sex = formData.get('sex');
        const birthDate = formData.get('birthDate');
        const weight = formData.get('weight');
        const microchipNumber = formData.get('microchipNumber');
        const isSpayed = formData.get('isSpayed') === 'true';
        const medicalNotes = formData.get('medicalNotes');
        const allergies = formData.get('allergies');
        const photoFile = formData.get('photo'); // File object

        let photoUrl = existingPet.pet_photo;

        // Handle New Photo Upload if provided
        if (photoFile && photoFile.size > 0) {
            const supabase = getSupabaseClient();
            if (!supabase) {
                return { success: false, error: 'Error de configuración: Faltan las claves de Supabase para subir imágenes.' };
            }

            const fileExt = photoFile.name.split('.').pop();
            const fileName = `${userId}/${uuidv4()}.${fileExt}`;

            const { data, error: uploadError } = await supabase.storage
                .from('pet-photos')
                .upload(fileName, photoFile, { contentType: photoFile.type, upsert: false });

            if (uploadError) {
                console.error('Supabase upload error:', uploadError);
                return { success: false, error: 'Error al subir la imagen a Supabase' };
            }

            const { data: { publicUrl } } = supabase.storage.from('pet-photos').getPublicUrl(fileName);
            photoUrl = publicUrl;
        }

        // Update Pet
        await db.run(`
            UPDATE pets SET
                pet_name = $1, species = $2, breed = $3, color = $4, sex = $5, 
                birth_date = $6, weight = $7, microchip_number = $8, 
                spayed_neutered = $9, medical_notes = $10, allergies = $11, 
                pet_photo = $12
            WHERE pet_id = $13
        `, [
            petName, species, breed, color, sex,
            birthDate || null, weight || null, microchipNumber || null, isSpayed ? 1 : 0,
            medicalNotes || null, allergies || null, photoUrl,
            petId
        ]);

        revalidatePath(`/pets/${petId}`);
        revalidatePath('/dashboard');
        return { success: true };

    } catch (error) {
        console.error('Update pet error:', error);
        return { success: false, error: error.message };
    }
}

export async function getLostPets({ city = '', species = '', query = '' } = {}) {
    try {
        let sql = `
            SELECT p.*, u.first_name, u.last_name, u.phone, u.city 
            FROM pets p
            LEFT JOIN users u ON p.user_id = u.user_id
            WHERE p.status = 'lost'
        `;
        const params = [];
        let paramIndex = 1;

        if (city) {
            sql += ` AND u.city ILIKE $${paramIndex}`;
            params.push(`%${city}%`);
            paramIndex++;
        }

        if (species) {
            sql += ` AND p.species = $${paramIndex}`;
            params.push(species);
            paramIndex++;
        }

        if (query) {
            sql += ` AND (p.pet_name ILIKE $${paramIndex} OR p.breed ILIKE $${paramIndex})`;
            params.push(`%${query}%`);
            paramIndex++;
        }

        sql += ` ORDER BY p.created_at DESC`;

        const lostPets = await db.getAll(sql, params);

        // Get unique cities for filter dropdown
        const cities = await db.getAll(`
            SELECT DISTINCT u.city 
            FROM pets p
            JOIN users u ON p.user_id = u.user_id
            WHERE p.status = 'lost' AND u.city IS NOT NULL
        `);

        return {
            success: true,
            data: lostPets,
            cities: cities.map(c => c.city).filter(Boolean)
        };

    } catch (error) {
        console.error('Error fetching lost pets:', error);
        return { success: false, error: error.message };
    }
}
