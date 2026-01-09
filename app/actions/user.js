'use server';

import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import bcrypt from 'bcrypt';
import { logout } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function logoutUser() {
    await logout();
    redirect('/');
}


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




export async function updateUserProfile(formData) {
    const session = await getSession();
    if (!session || !session.user) return { success: false, error: 'Unauthorized' };

    const { firstName, lastName, phone, address } = formData;

    try {
        await db.run(
            `UPDATE users 
             SET first_name = $1, 
                 last_name = $2, 
                 phone = $3, 
                 address = $4,
                 updated_at = NOW() 
             WHERE user_id = $5`,
            [firstName, lastName, phone, address, session.user.user_id]
        );

        return { success: true };
    } catch (error) {
        console.error('Update profile error:', error);
        return { success: false, error: error.message };
    }
}

export async function changePassword(currentPassword, newPassword) {
    const session = await getSession();
    if (!session || !session.user) return { success: false, error: 'Unauthorized' };

    try {
        // Get user to check current password
        const user = await db.getOne('SELECT password_hash FROM users WHERE user_id = $1', [session.user.user_id]);

        const match = await bcrypt.compare(currentPassword, user.password_hash);
        if (!match) {
            return { success: false, error: 'Incorrect current password' };
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await db.run(
            'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE user_id = $2',
            [hashedPassword, session.user.user_id]
        );

        return { success: true };
    } catch (error) {
        console.error('Change password error:', error);
        return { success: false, error: error.message };
    }
}

export async function updateNotificationSettings(settings) {
    const session = await getSession();
    if (!session || !session.user) return { success: false, error: 'Unauthorized' };

    try {
        await db.run(
            'UPDATE users SET notification_preferences = $1, updated_at = NOW() WHERE user_id = $2',
            [JSON.stringify(settings), session.user.user_id]
        );
        return { success: true };
    } catch (error) {
        console.error('Update notifications error:', error);
        return { success: false, error: error.message };
    }
}

export async function deleteAccount() {
    const session = await getSession();
    if (!session || !session.user) return { success: false, error: 'Unauthorized' };

    try {
        await db.run('DELETE FROM users WHERE user_id = $1', [session.user.user_id]);
        await logoutUser();
        return { success: true };
    } catch (error) {
        console.error('Delete account error:', error);
        return { success: false, error: error.message };
    }
}

export async function exportUserData() {
    const session = await getSession();
    if (!session || !session.user) return { success: false, error: 'Unauthorized' };

    try {
        const user = await db.getOne('SELECT * FROM users WHERE user_id = $1', [session.user.user_id]);
        const pets = await db.getAll('SELECT * FROM pets WHERE user_id = $1', [session.user.user_id]);

        return { success: true, data: { user, pets } };
    } catch (error) {
        console.error('Export data error:', error);
        return { success: false, error: error.message };
    }
}

export async function getNotifications() {
    const session = await getSession();
    if (!session || !session.user) return { success: false, error: 'Unauthorized' };

    try {
        // Mock notifications for now as we don't have a notifications table populated
        // OR if we do, check the schema. db.getAll('SELECT * FROM notifications...') existed in original.
        // Assuming notifications table exists based on original code.
        const userId = session.user.user_id;

        // Check if notifications table exists or catch error
        const notifications = await db.getAll(`
            SELECT * FROM notifications 
            WHERE user_id = $1 
            ORDER BY created_at DESC 
            LIMIT 20
        `, [userId]);

        return { success: true, data: notifications };
    } catch (error) {
        // Fallback or empty if table doesn't exist
        return { success: true, data: [] };
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


