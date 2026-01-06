'use server';

import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

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

    if (!petId || !type || !date) {
        return { error: 'Missing required fields' };
    }

    try {
        await db.query(
            `INSERT INTO medical_records (pet_id, record_type, description, date, vet_name)
             VALUES ($1, $2, $3, $4, $5)`,
            [petId, type, description, date, vetName]
        );

        revalidatePath(`/pets/${petId}`);
        return { success: true };
    } catch (error) {
        console.error('Error adding medical record:', error);
        return { error: error.message };
    }
}
