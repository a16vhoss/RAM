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
        return { success: false, error: 'Could not fetch records. Table might be missing.' };
    }
}

export async function addMedicalRecord(formData) {
    try {
        const session = await getSession();
        if (!session) return { error: 'Unauthorized' };

        const petId = formData.get('pet_id');
        const type = formData.get('type');
        const description = formData.get('description');
        const date = formData.get('date');
        const vetName = formData.get('vet_name');

        // Get attachments from JSON string (files were uploaded client-side)
        const attachmentsJson = formData.get('attachments_json');
        let attachments = [];

        if (attachmentsJson) {
            try {
                attachments = JSON.parse(attachmentsJson);
            } catch (e) {
                console.error('Failed to parse attachments JSON:', e);
            }
        }

        if (!petId || !type || !date) {
            return { error: 'Missing required fields (pet_id, type, or date)' };
        }

        // Insert record into database
        await db.query(
            `INSERT INTO medical_records (pet_id, record_type, description, date, vet_name, attachments)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [petId, type, description || '', date, vetName || '', JSON.stringify(attachments)]
        );

        revalidatePath(`/pets/${petId}`);
        return { success: true };
    } catch (error) {
        console.error('addMedicalRecord error:', error);
        return { error: `Server error: ${error.message}` };
    }
}

export async function updateMedicalRecord(formData) {
    try {
        const session = await getSession();
        if (!session) return { error: 'Unauthorized' };

        const recordId = formData.get('record_id');
        const petId = formData.get('pet_id');
        const type = formData.get('type');
        const description = formData.get('description');
        const date = formData.get('date');
        const vetName = formData.get('vet_name');

        // Get attachments from JSON string
        const attachmentsJson = formData.get('attachments_json');
        let attachments = [];

        if (attachmentsJson) {
            try {
                attachments = JSON.parse(attachmentsJson);
            } catch (e) {
                console.error('Failed to parse attachments JSON:', e);
            }
        }

        if (!recordId || !petId || !type || !date) {
            return { error: 'Missing required fields' };
        }

        await db.query(
            `UPDATE medical_records 
             SET record_type = $1, description = $2, date = $3, vet_name = $4, attachments = $5
             WHERE record_id = $6 AND pet_id = $7`,
            [type, description || '', date, vetName || '', JSON.stringify(attachments), recordId, petId]
        );

        revalidatePath(`/pets/${petId}`);
        return { success: true };
    } catch (error) {
        console.error('updateMedicalRecord error:', error);
        return { error: `Server error: ${error.message}` };
    }
}

export async function deleteMedicalRecord(recordId, petId) {
    try {
        const session = await getSession();
        if (!session) return { error: 'Unauthorized' };

        if (!recordId || !petId) {
            return { error: 'Missing record_id or pet_id' };
        }

        await db.query(
            'DELETE FROM medical_records WHERE record_id = $1 AND pet_id = $2',
            [recordId, petId]
        );

        revalidatePath(`/pets/${petId}`);
        return { success: true };
    } catch (error) {
        console.error('deleteMedicalRecord error:', error);
        return { error: `Server error: ${error.message}` };
    }
}

