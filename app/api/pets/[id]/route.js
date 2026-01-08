import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request, { params }) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    try {
        // Fetch pet without user_id restriction first
        const pet = await db.getOne('SELECT * FROM pets WHERE pet_id = $1', [id]);

        if (!pet) {
            return NextResponse.json({ error: 'Pet not found' }, { status: 404 });
        }

        // Check ownership via pet_owners (Family Mode)
        let [ownership] = await db.getAll(`
            SELECT role FROM pet_owners WHERE pet_id = $1 AND user_id = $2
        `, [id, session.user.user_id]);

        // Self-Repair: If not in pet_owners but user is the legacy creator (pet.user_id), fix it.
        // This handles pets created before the createPet update or during migration gaps.
        if (!ownership && pet.user_id === session.user.user_id) {
            console.log(`[Auto-Repair] Adding legacy owner ${session.user.user_id} to pet_owners for pet ${id}`);
            await db.run(`
                INSERT INTO pet_owners (pet_id, user_id, role)
                VALUES ($1, $2, 'owner')
                ON CONFLICT (pet_id, user_id) DO NOTHING
            `, [id, session.user.user_id]);
            ownership = { role: 'owner' };
        }

        const isOwner = !!ownership;

        // Access Control Logic
        // 1. Owner can see everything
        // 2. 'lost' status: Publicly visible (authenticated)
        // 3. Other status: Limited visibility (Found notification, etc)

        // Create response object
        const responsePet = { ...pet, isOwner };

        if (!isOwner) {
            // Redact sensitive info for non-owners
            if (pet.status !== 'lost') {
                delete responsePet.last_latitude;
                delete responsePet.last_longitude;
                delete responsePet.medical_notes; // Privacy
                // Keep basic info: name, photo, status, breed, etc.
            }
        }

        // Fetch documents and owners for this pet (Owner only)
        if (isOwner) {
            const documents = await db.getAll('SELECT * FROM documents WHERE pet_id = $1 ORDER BY issued_at DESC', [id]);
            responsePet.documents = documents;

            const owners = await db.getAll(`
                SELECT u.user_id, u.first_name, u.photo_url, po.role
                FROM pet_owners po
                JOIN users u ON po.user_id = u.user_id
                WHERE po.pet_id = $1
            `, [id]);
            responsePet.owners = owners;
        } else {
            responsePet.documents = [];
            responsePet.owners = [];
        }

        return NextResponse.json(responsePet);
    } catch (error) {
        console.error('Error fetching pet:', error);
        return NextResponse.json({ error: 'Server error: ' + error.message }, { status: 500 });
    }
}
