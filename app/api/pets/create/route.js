import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await request.json();
        const {
            petName, species, breed, color, sex, birthDate, weight,
            microchipNumber, isSpayed
        } = body;

        if (!petName || !species || !breed) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const petId = uuidv4();
        const userId = session.user.user_id;

        // Insert Pet
        const insert = db.prepare(`
      INSERT INTO pets (
        pet_id, user_id, pet_name, species, breed, color, sex, 
        birth_date, weight, microchip_number, spayed_neutered, pet_photo, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

        // TODO: Handle photo upload properly. Using placeholder for now.
        const photoUrl = `/api/placeholder?name=${petName}`;

        insert.run(
            petId, userId, petName, species, breed, color, sex,
            birthDate, weight || null, microchipNumber || null, isSpayed ? 1 : 0, photoUrl, 'Activo'
        );

        // Auto-generate Document entry (Active ownership)
        const docId = uuidv4();
        // Logic for unique registration number XXX-X-XXXXXXX-X
        // Using simple mock for now: 
        const regNum = `014-${new Date().getFullYear().toString().slice(-1)}-${Math.floor(Math.random() * 1000000).toString().padStart(7, '0')}-A`;

        const insertDoc = db.prepare(`
      INSERT INTO documents (document_id, pet_id, user_id, document_type, unique_registration_number, pdf_url)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

        insertDoc.run(docId, petId, userId, 'Acta de Propiedad', regNum, null);

        return NextResponse.json({ success: true, petId });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
