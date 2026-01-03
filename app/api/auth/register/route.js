import { NextResponse } from 'next/server';
import db from '@/lib/db';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { login } from '@/lib/auth';

export async function POST(request) {
    try {
        const body = await request.json();
        const { email, password, firstName, lastName, role, phone, city, state } = body;

        // Basic validation
        if (!email || !password || !firstName || !lastName) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Check if exists
        const check = db.prepare('SELECT user_id FROM users WHERE email = ?').get(email);
        if (check) {
            return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
        }

        const userId = uuidv4();
        const hashedPassword = await bcrypt.hash(password, 10);
        const userRole = role === 'provider' ? 'provider' : 'tutor'; // Default to tutor

        const insert = db.prepare(`
      INSERT INTO users (user_id, email, password_hash, first_name, last_name, role, phone, city, state)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

        insert.run(userId, email, hashedPassword, firstName, lastName, userRole, phone || null, city || null, state || null);

        const user = {
            user_id: userId,
            email,
            first_name: firstName,
            last_name: lastName,
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
