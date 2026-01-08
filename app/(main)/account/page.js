import { getSession } from '@/lib/auth';
import db from '@/lib/db';
import { redirect } from 'next/navigation';
import AccountClient from './AccountClient';

export default async function AccountPage() {
    const session = await getSession();
    if (!session) redirect('/login');

    const user = session.user;

    // Fetch user pets
    // Fetch user pets (owned and co-owned)
    const pets = await db.getAll(`
        SELECT pets.* 
        FROM pets 
        JOIN pet_owners ON pets.pet_id = pet_owners.pet_id 
        WHERE pet_owners.user_id = $1
    `, [user.user_id]);

    // Fetch user documents summary (owned and co-owned)
    const documents = await db.getAll(`
        SELECT d.document_type 
        FROM documents d 
        JOIN pets p ON d.pet_id = p.pet_id 
        JOIN pet_owners po ON p.pet_id = po.pet_id
        WHERE po.user_id = $1
    `, [user.user_id]);

    return (
        <AccountClient
            user={user}
            pets={pets}
            documents={documents}
        />
    );
}
