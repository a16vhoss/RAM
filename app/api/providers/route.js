import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request) {
    try {
        // Fetch all service providers from the database
        const providers = await db.getAll(`
            SELECT 
                provider_id,
                business_name,
                provider_type,
                address,
                phone,
                email,
                latitude,
                longitude,
                rating_average,
                total_reviews,
                is_verified,
                description,
                city,
                state,
                created_at
            FROM providers
            WHERE status = 'Activo'
            ORDER BY rating_average DESC, total_reviews DESC
        `);

        // Transform the data to include calculated fields
        const transformedProviders = providers.map(provider => ({
            ...provider,
            is_open: Math.random() > 0.3, // TODO: Replace with actual opening hours logic from schedule field
            photo: null // TODO: Add photo URL if available in your database
        }));

        return NextResponse.json(transformedProviders);
    } catch (error) {
        console.error('Error fetching providers:', error);
        return NextResponse.json(
            { error: 'Failed to fetch providers', details: error.message },
            { status: 500 }
        );
    }
}
