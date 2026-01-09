import { getSession } from '@/lib/auth';
import db from '@/lib/db';
import { redirect } from 'next/navigation';
import DocumentsClient from './DocumentsClient';

export default async function DocumentsPage() {
    const session = await getSession();
    if (!session) redirect('/login');

    const pets = await db.getAll('SELECT * FROM pets WHERE user_id = $1', [session.user.user_id]);
    const documents = await db.getAll(`
        SELECT 
            d.*, 
            p.pet_name, 
            p.pet_photo,
            p.breed,
            p.color,
            p.sex,
            p.birth_date,
            p.medical_notes,
            p.microchip_number,
            p.city as pet_city,
            p.father_breed,
            p.mother_breed,
            u.first_name as owner_first_name,
            u.last_name as owner_last_name,
            u.email as owner_email,
            u.phone as owner_phone,
            u.city as owner_city,
            u.location as owner_location
        FROM documents d 
        JOIN pets p ON d.pet_id = p.pet_id 
        JOIN users u ON p.user_id = u.user_id
        WHERE p.user_id = $1 
        ORDER BY d.issued_at DESC
    `, [session.user.user_id]);

    return (
        <DocumentsClient
            session={session}
            pets={pets}
            documents={documents}
        />
    );
}
