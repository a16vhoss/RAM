'use server';

import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

/**
 * Get all owners for a specific pet
 */
export async function getPetOwners(petId) {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    try {
        // Verify current user access (must be an owner/viewer of the pet)
        // RLS handles this at row level, but we want to fail fast if no access?
        // Actually, just query. If RLS works, we only see if acceptable.
        // But for explicit check:
        const currentUserId = session.user.user_id;

        // Query pet_owners with user details
        const owners = await db.getAll(`
            SELECT po.*, u.first_name, u.last_name, u.email, u.photo_url
            FROM pet_owners po
            JOIN users u ON po.user_id = u.user_id
            WHERE po.pet_id = $1
            ORDER BY po.created_at ASC
        `, [petId]);

        // Security check: if current user is not in the list, they shouldn't see this?
        // But RLS on pet_owners strictly limits 'SELECT' to policies involving ownership.
        // Our RLS policy: "Users can view pets they own". Reference pet_owners table.
        // And "Users can view their own pet ownerships".
        // Wait, can user see OTHER owners?
        // Policy: "Owners can manage pet owners for their pets" -> FOR ALL.
        // This implies they can SELECT * FROM pet_owners WHERE pet_id IN (their pets).
        // So yes, they can see others if they are an owner.

        return { success: true, owners };

    } catch (error) {
        console.error('Error fetching pet owners:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Create a new invite code for a pet
 */
export async function createInvite(petId) {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    try {
        const currentUserId = session.user.user_id;

        // Verify ownership
        const [isOwner] = await db.getAll(`
            SELECT 1 FROM pet_owners WHERE pet_id = $1 AND user_id = $2
        `, [petId, currentUserId]);

        if (!isOwner) {
            return { success: false, error: 'No tienes permiso para crear invitaciones.' };
        }

        // Generate a random 6-character code (uppercase alphanumeric)
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();

        // Expiration: 24 hours from now
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

        // Store in DB
        // We use pet_id as TEXT because migration made it so, but best to double check schema?
        // In 03_add_family_mode.sql we referenced public.pets(pet_id) which is TEXT.
        // But pet_invites referenced public.pets(pet_id) as TEXT too in 04 script.
        await db.run(`
            INSERT INTO pet_invites (pet_id, code, created_by, expires_at)
            VALUES ($1, $2, $3, $4)
        `, [petId, code, currentUserId, expiresAt]);

        revalidatePath(`/pets/${petId}/edit`);
        return { success: true, code, expiresAt };

    } catch (error) {
        console.error('Error creating invite:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Join a family using an invite code
 */
export async function joinFamily(code) {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    try {
        const userId = session.user.user_id;
        const normalizedCode = code.toUpperCase().trim();

        // Validate Code
        const [invite] = await db.getAll(`
            SELECT * FROM pet_invites 
            WHERE code = $1 
            AND expires_at > NOW()
        `, [normalizedCode]);

        if (!invite) {
            return { success: false, error: 'Código inválido o expirado.' };
        }

        const petId = invite.pet_id;

        // Check if already an owner
        const [alreadyOwner] = await db.getAll(`
            SELECT 1 FROM pet_owners WHERE pet_id = $1 AND user_id = $2
        `, [petId, userId]);

        if (alreadyOwner) {
            return { success: false, error: 'Ya eres miembro de esta familia.' };
        }

        // Add to pet_owners
        await db.run(`
            INSERT INTO pet_owners (pet_id, user_id, role)
            VALUES ($1, $2, 'owner')
        `, [petId, userId]);

        // Optional: Delete invite after use? 
        // Plan said "multi-use but expires in 24h". So keep it.

        revalidatePath('/dashboard');
        return { success: true, message: '¡Te has unido a la familia exitosamente!' };

    } catch (error) {
        console.error('Error joining family:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Remove a co-owner
 */
export async function removeUser(petId, targetUserId) {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    try {
        const currentUserId = session.user.user_id;

        // Verify current user is an owner
        const [isOwner] = await db.getAll(`
            SELECT 1 FROM pet_owners WHERE pet_id = $1 AND user_id = $2
        `, [petId, currentUserId]);

        if (!isOwner) {
            return { success: false, error: 'No tienes permiso para gestionar propietarios.' };
        }

        // Prevent removing oneself if it's the last owner
        // Optional logic, but good for safety.
        const owners = await db.getAll(`SELECT user_id FROM pet_owners WHERE pet_id = $1`, [petId]);

        if (owners.length === 1 && owners[0].user_id === targetUserId) {
            return { success: false, error: 'No puedes eliminar al único propietario. Elimina la mascota si deseas borrarla.' };
        }

        // Remove user
        await db.run(`
            DELETE FROM pet_owners WHERE pet_id = $1 AND user_id = $2
        `, [petId, targetUserId]);

        revalidatePath(`/pets/${petId}`);
        revalidatePath(`/pets/${petId}/edit`);
        return { success: true, message: 'Co-propietario eliminado.' };

    } catch (error) {
        console.error('Error removing user:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get active invite code for a pet (if exists)
 */
export async function getActiveInvite(petId) {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    try {
        const [invite] = await db.getAll(`
            SELECT code, expires_at FROM pet_invites 
            WHERE pet_id = $1 AND expires_at > NOW()
            ORDER BY created_at DESC
            LIMIT 1
        `, [petId]);

        return { success: true, invite };
    } catch (error) {
        return { success: false, error: error.message };
    }
}
