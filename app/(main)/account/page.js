import { getSession } from '@/lib/auth';
import db from '@/lib/db';
import { redirect } from 'next/navigation';
import AccountClient from './AccountClient';

export default async function AccountPage() {
    const session = await getSession();
    if (!session) redirect('/login');

    const user = session.user;

    // Fetch user pets
    const pets = await db.getAll('SELECT * FROM pets WHERE user_id = $1', [user.user_id]);

    // Fetch user documents summary
    const documents = await db.getAll(`
        SELECT d.document_type 
        FROM documents d 
        JOIN pets p ON d.pet_id = p.pet_id 
        WHERE p.user_id = $1
    `, [user.user_id]);

    return (
        <AccountClient
            user={user}
            pets={pets}
            documents={documents}
        />
    );
}
