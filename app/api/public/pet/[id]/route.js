import db from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
    const { id } = await params;

    try {
        const pet = await db.getOne(`
            SELECT pets.*, users.first_name, users.last_name, users.email, users.phone, users.city 
            FROM pets 
            JOIN users ON pets.user_id = users.user_id 
            WHERE pets.pet_id = $1
        `, [id]);

        if (!pet) {
            return NextResponse.json({ error: 'Pet not found' }, { status: 404 });
        }

        return NextResponse.json(pet);
    } catch (error) {
        console.error('Error fetching public pet:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
