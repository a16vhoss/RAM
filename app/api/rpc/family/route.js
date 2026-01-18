import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(request) {
    const session = await getSession();
    if (!session || !session.user) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { action, data } = await request.json();

    try {
        switch (action) {
            case 'getPetOwners':
                // Check if user is associated with pet via pet_owners? Logic from action:
                const owners = await db.getAll(`
                    SELECT po.*, u.first_name, u.last_name, u.email, u.photo_url
                    FROM pet_owners po
                    JOIN users u ON po.user_id = u.user_id
                    WHERE po.pet_id = $1
                    ORDER BY po.created_at ASC
                `, [data.petId]);
                return NextResponse.json({ success: true, owners });

            case 'createInvite':
                const currentUserId = session.user.user_id;
                const [isOwner] = await db.getAll(`SELECT 1 FROM pet_owners WHERE pet_id = $1 AND user_id = $2`, [data.petId, currentUserId]);
                if (!isOwner) return NextResponse.json({ success: false, error: 'No tienes permiso para crear invitaciones.' });

                const code = Math.random().toString(36).substring(2, 8).toUpperCase();
                const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
                await db.run(`INSERT INTO pet_invites (pet_id, code, created_by, expires_at) VALUES ($1, $2, $3, $4)`, [data.petId, code, currentUserId, expiresAt]);
                return NextResponse.json({ success: true, code, expiresAt });

            case 'joinFamily':
                const normalizedCode = data.code.toUpperCase().trim();
                const [invite] = await db.getAll(`SELECT * FROM pet_invites WHERE code = $1 AND expires_at > NOW()`, [normalizedCode]);
                if (!invite) return NextResponse.json({ success: false, error: 'Código inválido o expirado.' });

                const petId = invite.pet_id;
                const userId = session.user.user_id;
                const [alreadyOwner] = await db.getAll(`SELECT 1 FROM pet_owners WHERE pet_id = $1 AND user_id = $2`, [petId, userId]);
                if (alreadyOwner) return NextResponse.json({ success: false, error: 'Ya eres miembro de esta familia.' });

                await db.run(`INSERT INTO pet_owners (pet_id, user_id, role) VALUES ($1, $2, 'owner')`, [petId, userId]);
                return NextResponse.json({ success: true, message: '¡Te has unido a la familia exitosamente!' });

            case 'removeUser':
                const myId = session.user.user_id;
                const [amOwner] = await db.getAll(`SELECT 1 FROM pet_owners WHERE pet_id = $1 AND user_id = $2`, [data.petId, myId]);
                if (!amOwner) return NextResponse.json({ success: false, error: 'No tienes permiso.' });

                const allOwners = await db.getAll(`SELECT user_id FROM pet_owners WHERE pet_id = $1`, [data.petId]);
                if (allOwners.length === 1 && allOwners[0].user_id === data.targetUserId) {
                    return NextResponse.json({ success: false, error: 'No puedes eliminar al único propietario.' });
                }

                await db.run(`DELETE FROM pet_owners WHERE pet_id = $1 AND user_id = $2`, [data.petId, data.targetUserId]);
                return NextResponse.json({ success: true, message: 'Co-propietario eliminado.' });

            case 'getActiveInvite':
                const [activeInvite] = await db.getAll(`SELECT code, expires_at FROM pet_invites WHERE pet_id = $1 AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1`, [data.petId]);
                return NextResponse.json({ success: true, invite: activeInvite });

            default:
                return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
        }
    } catch (error) {
        console.error(`RPC Family error ${action}:`, error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
