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
 * Invite a user to be a co-owner by email
 */
export async function inviteUser(petId, email) {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    try {
        const currentUserId = session.user.user_id;

        // Verify current user is an owner
        const [isOwner] = await db.getAll(`
            SELECT 1 FROM pet_owners WHERE pet_id = $1 AND user_id = $2
        `, [petId, currentUserId]);

        if (!isOwner) {
            return { success: false, error: 'No tienes permiso para invitar co-propietarios.' };
        }

        // Find user by email
        // We need to query auth.users or public.users. Public users is safer/easier if updated.
        const [targetUser] = await db.getAll(`
            SELECT user_id FROM users WHERE email = $1
        `, [email]);

        if (!targetUser) {
            return { success: false, error: 'Usuario no encontrado. Asegúrate de que ya esté registrado en la app.' };
        }

        if (targetUser.user_id === currentUserId) {
            return { success: false, error: 'Ya eres propietario de esta mascota.' };
        }

        // Check if already an owner
        const [alreadyOwner] = await db.getAll(`
            SELECT 1 FROM pet_owners WHERE pet_id = $1 AND user_id = $2
        `, [petId, targetUser.user_id]);

        if (alreadyOwner) {
            return { success: false, error: 'Este usuario ya es co-propietario.' };
        }

        // Add to pet_owners
        await db.run(`
            INSERT INTO pet_owners (pet_id, user_id, role)
            VALUES ($1, $2, 'owner')
        `, [petId, targetUser.user_id]);

        revalidatePath(`/pets/${petId}`);
        revalidatePath(`/pets/${petId}/edit`);

        return { success: true, message: 'Co-propietario añadido exitosamente.' };

    } catch (error) {
        console.error('Error inviting user:', error);
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

        // Prevent removing oneself if it's the last owner?
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
