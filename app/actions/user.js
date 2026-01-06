'use server';

import db from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function updateUserLocation(zone, lat, lng) {
    const session = await getSession();

    if (!session || !session.user) {
        return { success: false, error: 'User not authenticated' };
    }

    try {
        await db.run(
            `UPDATE users 
             SET detected_zone = $1, 
                 last_latitude = $2, 
                 last_longitude = $3, 
                 updated_at = NOW() 
             WHERE user_id = $4`,
            [zone, lat, lng, session.user.user_id]
        );

        return { success: true };
    } catch (error) {
        console.error('Error updating user location in DB:', error);
        return { success: false, error: error.message };
    }
}
