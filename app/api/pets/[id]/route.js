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
        const pet = await db.getOne('SELECT * FROM pets WHERE pet_id = $1 AND user_id = $2', [id, session.user.user_id]);

        if (!pet) {
            return NextResponse.json({ error: 'Pet not found' }, { status: 404 });
        }

        // Fetch documents for this pet
        const documents = await db.getAll('SELECT * FROM documents WHERE pet_id = $1 ORDER BY issued_at DESC', [id]);
        pet.documents = documents;

        return NextResponse.json(pet);
    } catch (error) {
        console.error('Error fetching pet:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
