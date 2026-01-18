import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request) {
    const { action, data } = await request.json();

    try {
        switch (action) {
            case 'getProviders':
                // Could store filters in data?
                // For now, return all active
                const providers = await db.getAll(`
                    SELECT * FROM providers 
                    WHERE status = 'Activo' 
                    ORDER BY rating_average DESC, total_reviews DESC
                    LIMIT 50
                `);
                return NextResponse.json({ success: true, data: providers });

            case 'getProvider':
                if (!data.id) return NextResponse.json({ success: false, error: 'ID required' });
                const [provider] = await db.getAll("SELECT * FROM providers WHERE provider_id = $1", [data.id]);
                if (!provider) return NextResponse.json({ success: false, error: 'Not found' });
                return NextResponse.json({ success: true, data: provider });

            default:
                return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
        }
    } catch (error) {
        console.error(`RPC Directory error ${action}:`, error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
