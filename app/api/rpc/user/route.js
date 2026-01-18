import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession, logout } from '@/lib/auth';
import bcrypt from 'bcrypt';

export async function POST(request) {
    const session = await getSession();
    const { action, data } = await request.json();

    // Allow logout without session if needed, but mostly need session
    if (!session?.user && action !== 'logoutUser') {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    try {
        switch (action) {
            case 'logoutUser':
                await logout();
                return NextResponse.json({ success: true });

            case 'updateUserLocation':
                await db.run(
                    `UPDATE users 
                     SET detected_zone = $1, last_latitude = $2, last_longitude = $3, updated_at = NOW() 
                     WHERE user_id = $4`,
                    [data.zone, data.lat, data.lng, session.user.user_id]
                );
                return NextResponse.json({ success: true });

            case 'updateUserProfile':
                await db.run(
                    `UPDATE users 
                     SET first_name = $1, last_name = $2, phone = $3, address = $4, updated_at = NOW() 
                     WHERE user_id = $5`,
                    [data.firstName, data.lastName, data.phone, data.address, session.user.user_id]
                );
                return NextResponse.json({ success: true });

            case 'changePassword':
                const user = await db.getOne('SELECT password_hash FROM users WHERE user_id = $1', [session.user.user_id]);
                const match = await bcrypt.compare(data.currentPassword, user.password_hash);
                if (!match) return NextResponse.json({ success: false, error: 'Incorrect current password' });

                const hashedPassword = await bcrypt.hash(data.newPassword, 10);
                await db.run('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE user_id = $2', [hashedPassword, session.user.user_id]);
                return NextResponse.json({ success: true });

            case 'updateNotificationSettings':
                await db.run('UPDATE users SET notification_preferences = $1, updated_at = NOW() WHERE user_id = $2', [JSON.stringify(data.settings), session.user.user_id]);
                return NextResponse.json({ success: true });

            case 'deleteAccount':
                await db.run('DELETE FROM users WHERE user_id = $1', [session.user.user_id]);
                await logout();
                return NextResponse.json({ success: true });

            case 'exportUserData':
                const exportUser = await db.getOne('SELECT * FROM users WHERE user_id = $1', [session.user.user_id]);
                const petsExport = await db.getAll('SELECT * FROM pets WHERE user_id = $1', [session.user.user_id]);
                return NextResponse.json({ success: true, data: { user: exportUser, pets: petsExport } });

            case 'getDashboardData':
                const userPets = await db.getAll(`
                    SELECT pets.* 
                    FROM pets 
                    JOIN pet_owners ON pets.pet_id = pet_owners.pet_id 
                    WHERE pet_owners.user_id = $1
                `, [session.user.user_id]);

                const userDocs = await db.getAll(`
                    SELECT d.document_type 
                    FROM documents d 
                    JOIN pets p ON d.pet_id = p.pet_id 
                    JOIN pet_owners po ON p.pet_id = po.pet_id
                    WHERE po.user_id = $1
                `, [session.user.user_id]);

                const dailyTip = await db.getOne(`
                    SELECT content FROM daily_tips WHERE display_date = CURRENT_DATE
                `);

                return NextResponse.json({
                    success: true,
                    data: {
                        pets: userPets,
                        documents: userDocs,
                        dailyTip: dailyTip?.content || "La hidratación es clave. Cambia el agua de tu mascota 3 veces al día."
                    }
                });

            case 'getNotifications':
                // Simplified: returning empty array as per original mock logic if table issues exist, or implement select
                const notifications = await db.getAll(`SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20`, [session.user.user_id]);
                return NextResponse.json({ success: true, data: notifications || [] });

            case 'markNotificationAsRead':
                await db.run('UPDATE notifications SET is_read = TRUE WHERE notification_id = $1', [data.notificationId]);
                return NextResponse.json({ success: true });

            case 'getDocuments':
                const pets = await db.getAll('SELECT * FROM pets WHERE user_id = $1', [session.user.user_id]);
                const documents = await db.getAll(`
                    SELECT 
                        d.*, 
                        p.pet_name, 
                        p.pet_photo,
                        p.breed,
                        p.color,
                        p.sex,
                        p.birth_date,
                        p.medical_notes,
                        p.city as pet_city,
                        p.father_breed,
                        p.mother_breed,
                        u.first_name as owner_first_name,
                        u.last_name as owner_last_name,
                        u.email as owner_email,
                        u.phone as owner_phone,
                        u.city as owner_city,
                        u.address as owner_address,
                        u.detected_zone as owner_location
                    FROM documents d 
                    JOIN pets p ON d.pet_id = p.pet_id 
                    JOIN users u ON p.user_id = u.user_id
                    WHERE p.user_id = $1 
                    ORDER BY d.issued_at DESC
                `, [session.user.user_id]);

                return NextResponse.json({
                    success: true,
                    data: { pets, documents }
                });

            default:
                return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
        }
    } catch (error) {
        console.error(`Error in RPC ${action}:`, error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
