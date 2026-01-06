
import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
    try {
        const res = await db.query('SELECT NOW()');
        return NextResponse.json({ success: true, time: res.rows[0].now });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
