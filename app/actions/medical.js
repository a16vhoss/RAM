'use server';

import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

function getSupabaseClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error('Missing Supabase environment variables');
        return null;
    }
    return createClient(supabaseUrl, supabaseKey);
}

export async function getMedicalRecords(petId) {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    try {
        const records = await db.getAll(
            'SELECT * FROM medical_records WHERE pet_id = $1 ORDER BY date DESC',
            [petId]
        );
        return { success: true, data: records || [] };
    } catch (error) {
        console.error('Error fetching medical records:', error);
        // Fail gracefully if table doesn't exist
        return { success: false, error: 'Could not fetch records. Table might be missing.' };
    }
}

export async function addMedicalRecord(formData) {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    const petId = formData.get('pet_id');
    const type = formData.get('type');
    const description = formData.get('description');
    const date = formData.get('date');
    const vetName = formData.get('vet_name');

    // Handle File Uploads
    const files = formData.getAll('files'); // Expecting 'files' append logic
    let attachments = [];

    if (files && files.length > 0) {
        try {
            const supabase = getSupabaseClient();
            if (supabase) {
                for (const file of files) {
                    // Skip empty files or non-File objects
                    if (!file || typeof file === 'string' || file.size === 0) continue;

                    const fileExt = file.name.split('.').pop();
                    const fileName = `${petId}/${uuidv4()}.${fileExt}`;

                    const { error: uploadError } = await supabase.storage
                        .from('medical-records')
                        .upload(fileName, file, { contentType: file.type, upsert: false });

                    if (!uploadError) {
                        const { data: { publicUrl } } = supabase.storage
                            .from('medical-records')
                            .getPublicUrl(fileName);

                        attachments.push({
                            name: file.name,
                            type: file.type,
                            url: publicUrl
                        });
                    } else {
                        console.error('Failed to upload file:', file.name, uploadError.message);
                    }
                }
            } else {
                console.warn('Supabase client not available - skipping file uploads');
            }
        } catch (uploadErr) {
            console.error('File upload error (storage may not be configured):', uploadErr.message);
            // Continue without attachments rather than crashing
        }
    }

    if (!petId || !type || !date) {
        return { error: 'Missing required fields' };
    }

    try {
        await db.query(
            `INSERT INTO medical_records (pet_id, record_type, description, date, vet_name, attachments)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [petId, type, description, date, vetName, JSON.stringify(attachments)]
        );

        revalidatePath(`/pets/${petId}`);
        return { success: true };
    } catch (error) {
        console.error('Error adding medical record:', error);
        return { error: error.message };
    }
}
