'use server';

import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

/**
 * Get all communities (optionally filtered by type or species)
 */
export async function getCommunities(filters = {}) {
    try {
        let query = `
            SELECT * FROM communities
            WHERE 1=1
        `;
        const params = [];
        let paramIndex = 1;

        if (filters.type) {
            query += ` AND type = $${paramIndex++}`;
            params.push(filters.type);
        }

        if (filters.species) {
            query += ` AND species = $${paramIndex++}`;
            params.push(filters.species);
        }

        query += ` ORDER BY member_count DESC, name ASC`;

        const communities = await db.getAll(query, params);
        return { success: true, data: communities };
    } catch (error) {
        console.error('Error fetching communities:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get a single community by slug
 */
export async function getCommunityBySlug(slug) {
    try {
        const [community] = await db.getAll(`
            SELECT * FROM communities WHERE slug = $1
        `, [slug]);

        if (!community) {
            return { success: false, error: 'Comunidad no encontrada' };
        }

        return { success: true, data: community };
    } catch (error) {
        console.error('Error fetching community:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get communities the current user is a member of
 */
export async function getUserCommunities() {
    const session = await getSession();
    if (!session) return { success: false, error: 'No autenticado' };

    try {
        const communities = await db.getAll(`
            SELECT c.*, cm.role, cm.is_auto_joined, cm.joined_at
            FROM communities c
            JOIN community_members cm ON c.community_id = cm.community_id
            WHERE cm.user_id = $1
            ORDER BY cm.joined_at DESC
        `, [session.user.user_id]);

        return { success: true, data: communities };
    } catch (error) {
        console.error('Error fetching user communities:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Check if user is member of a community
 */
export async function isMember(communityId) {
    const session = await getSession();
    if (!session) return { success: true, isMember: false };

    try {
        const [membership] = await db.getAll(`
            SELECT 1 FROM community_members 
            WHERE community_id = $1 AND user_id = $2
        `, [communityId, session.user.user_id]);

        return { success: true, isMember: !!membership };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Join a community manually
 */
export async function joinCommunity(communityId) {
    const session = await getSession();
    if (!session) return { success: false, error: 'No autenticado' };

    try {
        await db.run(`
            INSERT INTO community_members (community_id, user_id, is_auto_joined)
            VALUES ($1, $2, false)
            ON CONFLICT (community_id, user_id) DO NOTHING
        `, [communityId, session.user.user_id]);

        revalidatePath('/communities');
        return { success: true, message: 'Te has unido a la comunidad' };
    } catch (error) {
        console.error('Error joining community:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Leave a community
 */
export async function leaveCommunity(communityId) {
    const session = await getSession();
    if (!session) return { success: false, error: 'No autenticado' };

    try {
        await db.run(`
            DELETE FROM community_members 
            WHERE community_id = $1 AND user_id = $2
        `, [communityId, session.user.user_id]);

        revalidatePath('/communities');
        return { success: true, message: 'Has salido de la comunidad' };
    } catch (error) {
        console.error('Error leaving community:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Auto-join user to communities based on their pets
 * Called when user registers a new pet or at login
 */
export async function autoJoinUserToCommunities(userId) {
    try {
        // Get user's pets with species and breed
        const pets = await db.getAll(`
            SELECT DISTINCT species, breed FROM pets p
            JOIN pet_owners po ON p.pet_id = po.pet_id
            WHERE po.user_id = $1
        `, [userId]);

        for (const pet of pets) {
            // Join species community
            if (pet.species) {
                const [speciesCommunity] = await db.getAll(`
                    SELECT community_id FROM communities 
                    WHERE type = 'species' AND species = $1
                `, [pet.species]);

                if (speciesCommunity) {
                    await db.run(`
                        INSERT INTO community_members (community_id, user_id, is_auto_joined)
                        VALUES ($1, $2, true)
                        ON CONFLICT (community_id, user_id) DO NOTHING
                    `, [speciesCommunity.community_id, userId]);
                }
            }

            // Create/join breed community if breed exists
            if (pet.breed && pet.breed.trim() !== '' && pet.breed.toLowerCase() !== 'mestizo') {
                // Use the SQL function to get or create breed community
                const [result] = await db.getAll(`
                    SELECT get_or_create_breed_community($1, $2) as community_id
                `, [pet.species, pet.breed]);

                if (result?.community_id) {
                    await db.run(`
                        INSERT INTO community_members (community_id, user_id, is_auto_joined)
                        VALUES ($1, $2, true)
                        ON CONFLICT (community_id, user_id) DO NOTHING
                    `, [result.community_id, userId]);
                }
            }
        }

        return { success: true };
    } catch (error) {
        console.error('Error auto-joining communities:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get community statistics
 */
export async function getCommunityStats(communityId) {
    try {
        const [stats] = await db.getAll(`
            SELECT 
                member_count,
                post_count,
                (SELECT COUNT(*) FROM community_posts WHERE community_id = $1 AND created_at > NOW() - INTERVAL '24 hours') as posts_today
            FROM communities
            WHERE community_id = $1
        `, [communityId]);

        return { success: true, data: stats };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Search communities by name
 */
export async function searchCommunities(query) {
    try {
        const communities = await db.getAll(`
            SELECT * FROM communities
            WHERE name ILIKE $1 OR breed ILIKE $1 OR species ILIKE $1
            ORDER BY member_count DESC
            LIMIT 20
        `, [`%${query}%`]);

        return { success: true, data: communities };
    } catch (error) {
        return { success: false, error: error.message };
    }
}
