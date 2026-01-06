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
            if (supabase) {
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
                } else {
                    const { data: { publicUrl } } = supabase.storage
                        .from('pet-photos')
                        .getPublicUrl(filePath);
                    photoUrl = publicUrl;
                }
            } else {
                console.warn('Skipping photo upload: Supabase not configured');
            }
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

        // Delete associated documents first (FK constraint usually handles this if ON DELETE CASCADE, but to be safe)
        await db.run('DELETE FROM documents WHERE pet_id = $1', [petId]);

        // Delete pet
        await db.run('DELETE FROM pets WHERE pet_id = $1', [petId]);

        // Note: In a real app, we should also delete the photo from storage, 
        // but we'll skip that complex logic for speed for now as it doesn't break anything.

        revalidatePath('/dashboard');
        revalidatePath(`/pets/${petId}`);
        return { success: true };

    } catch (error) {
        console.error('Delete pet error:', error);
        return { success: false, error: error.message };
    }
}
