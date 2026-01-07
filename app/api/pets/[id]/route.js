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

        const isOwner = pet.user_id === session.user.user_id;

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

        // Fetch documents for this pet (Owner only or maybe limited?)
        if (isOwner) {
            const documents = await db.getAll('SELECT * FROM documents WHERE pet_id = $1 ORDER BY issued_at DESC', [id]);
            responsePet.documents = documents;
        } else {
            responsePet.documents = [];
        }

        return NextResponse.json(responsePet);
    } catch (error) {
        console.error('Error fetching pet:', error);
        return NextResponse.json({ error: 'Server error: ' + error.message }, { status: 500 });
    }
