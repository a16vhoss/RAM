import { getSession } from '@/lib/auth';
import db from '@/lib/db';
import { redirect } from 'next/navigation';
import DocumentsClient from './DocumentsClient';

export default async function DocumentsPage() {
    const session = await getSession();
    if (!session) redirect('/login');

    const pets = await db.getAll('SELECT * FROM pets WHERE user_id = $1', [session.user.user_id]);
    const documents = await db.getAll('SELECT d.*, p.pet_name FROM documents d JOIN pets p ON d.pet_id = p.pet_id WHERE p.user_id = $1 ORDER BY d.issued_at DESC', [session.user.user_id]);

    return (
        <DocumentsClient
            session={session}
            pets={pets}
            documents={documents}
        />
    );
}
