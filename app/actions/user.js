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

export async function getNotifications() {
    const session = await getSession();
    if (!session || !session.user) return { success: false, error: 'Unauthorized' };

    try {
        const userId = session.user.user_id;

        const notifications = await db.getAll(`
            SELECT * FROM notifications 
            WHERE user_id = $1 
            ORDER BY created_at DESC 
            LIMIT 20
        `, [userId]);

        return { success: true, data: notifications };
    } catch (error) {
        console.error('Get notifications error:', error);
        return { success: false, error: error.message };
    }
}

export async function markNotificationAsRead(notificationId) {
    const session = await getSession();
    if (!session || !session.user) return { success: false, error: 'Unauthorized' };

    try {
        await db.run('UPDATE notifications SET is_read = TRUE WHERE notification_id = $1', [notificationId]);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}
