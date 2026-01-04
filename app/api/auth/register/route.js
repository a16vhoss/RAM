import { NextResponse } from 'next/server';
import db from '@/lib/db';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { login } from '@/lib/auth';

export async function POST(request) {
    try {
        const body = await request.json();
        console.log('Register API Body:', body); // Debugging

        // Extract variables with fallbacks if mix names are used
        const { email, password, firstName, lastName, role, phone, city, state, businessName, providerType } = body;

        // Also support 'nombre' / 'apellido' if sent by mismatch version
        const finalFirstName = firstName || body.nombre;
        const finalLastName = lastName || body.apellido;

        // Basic validation
        if (!email || !password || !finalFirstName || !finalLastName) {
            console.error('Missing fields:', { email, hasPassword: !!password, finalFirstName, finalLastName });
            return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
        }

        // Check if exists
        const check = await db.getOne('SELECT user_id FROM users WHERE email = $1', [email]);
        if (check) {
            return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
        }

        const userId = uuidv4();
        const hashedPassword = await bcrypt.hash(password, 10);
        const userRole = role === 'provider' ? 'provider' : 'tutor'; // Default to tutor

        await db.run(`
      INSERT INTO users (user_id, email, password_hash, first_name, last_name, role, phone, city, state)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [userId, email, hashedPassword, finalFirstName, finalLastName, userRole, phone || null, city || null, state || null]);

        const user = {
            user_id: userId,
            email,
            first_name: finalFirstName,
            last_name: finalLastName,
            role: userRole,
            city,
            state
        };

        await login(user);

        return NextResponse.json({ success: true, user });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
