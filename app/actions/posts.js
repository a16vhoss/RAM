'use server';

import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

/**
 * Create a new post in a community
 */
export async function createPost(communityId, data) {
    const session = await getSession();
    if (!session) return { success: false, error: 'No autenticado' };

    const { content, postType = 'general', mediaUrls = [] } = data;

    if (!content || content.trim() === '') {
        return { success: false, error: 'El contenido no puede estar vacío' };
    }

    try {
        const [post] = await db.getAll(`
            INSERT INTO community_posts (community_id, user_id, content, post_type, media_urls)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `, [communityId, session.user.user_id, content.trim(), postType, JSON.stringify(mediaUrls)]);

        revalidatePath(`/communities`);
        return { success: true, data: post };
    } catch (error) {
        console.error('Error creating post:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get posts feed for a community (paginated)
 */
export async function getPostsFeed(communityId, page = 1, limit = 20) {
    try {
        const offset = (page - 1) * limit;

        const posts = await db.getAll(`
            SELECT 
                p.*,
                u.first_name,
                u.last_name,
                u.photo_url as user_photo,
                (SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.post_id) as likes_count,
                (SELECT COUNT(*) FROM post_comments pc WHERE pc.post_id = p.post_id) as comments_count
            FROM community_posts p
            LEFT JOIN users u ON p.user_id = u.user_id
            WHERE p.community_id = $1
            ORDER BY p.is_pinned DESC, p.created_at DESC
            LIMIT $2 OFFSET $3
        `, [communityId, limit, offset]);

        // Check if current user has liked each post
        const session = await getSession();
        if (session) {
            // Verify admin role once
            const [userRole] = await db.getAll('SELECT role FROM users WHERE user_id = $1', [session.user.user_id]);
            const isAdmin = userRole?.role === 'admin';

            for (const post of posts) {
                const [liked] = await db.getAll(`
                    SELECT 1 FROM post_likes WHERE post_id = $1 AND user_id = $2
                `, [post.post_id, session.user.user_id]);
                post.isLiked = !!liked;
                post.isOwner = post.user_id === session.user.user_id;
                post.canDelete = post.isOwner || isAdmin;
            }
        }

        return { success: true, data: posts };
    } catch (error) {
        console.error('Error fetching posts:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get a single post by ID
 */
export async function getPost(postId) {
    try {
        const [post] = await db.getAll(`
            SELECT 
                p.*,
                u.first_name,
                u.last_name,
                u.photo_url as user_photo,
                c.name as community_name,
                c.slug as community_slug
            FROM community_posts p
            LEFT JOIN users u ON p.user_id = u.user_id
            LEFT JOIN communities c ON p.community_id = c.community_id
            WHERE p.post_id = $1
        `, [postId]);

        if (!post) {
            return { success: false, error: 'Post no encontrado' };
        }

        // Check if current user has liked
        const session = await getSession();
        if (session) {
            const [liked] = await db.getAll(`
                SELECT 1 FROM post_likes WHERE post_id = $1 AND user_id = $2
            `, [postId, session.user.user_id]);
            const [userRole] = await db.getAll('SELECT role FROM users WHERE user_id = $1', [session.user.user_id]);
            const isAdmin = userRole?.role === 'admin';

            post.isLiked = !!liked;
            post.isOwner = post.user_id === session.user.user_id;
            post.canDelete = post.isOwner || isAdmin;
        }

        return { success: true, data: post };
    } catch (error) {
        console.error('Error fetching post:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Like a post
 */
export async function likePost(postId) {
    const session = await getSession();
    if (!session) return { success: false, error: 'No autenticado' };

    try {
        await db.run(`
            INSERT INTO post_likes (post_id, user_id)
            VALUES ($1, $2)
            ON CONFLICT (post_id, user_id) DO NOTHING
        `, [postId, session.user.user_id]);

        return { success: true };
    } catch (error) {
        console.error('Error liking post:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Unlike a post
 */
export async function unlikePost(postId) {
    const session = await getSession();
    if (!session) return { success: false, error: 'No autenticado' };

    try {
        await db.run(`
            DELETE FROM post_likes 
            WHERE post_id = $1 AND user_id = $2
        `, [postId, session.user.user_id]);

        return { success: true };
    } catch (error) {
        console.error('Error unliking post:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Delete a post (only author can delete)
 */
export async function deletePost(postId) {
    const session = await getSession();
    if (!session) return { success: false, error: 'No autenticado' };

    try {
        // Verify ownership
        const [post] = await db.getAll(`
            SELECT user_id, community_id FROM community_posts WHERE post_id = $1
        `, [postId]);

        if (!post) {
            return { success: false, error: 'Post no encontrado' };
        }

        // Check if user is owner or admin
        const [userRole] = await db.getAll('SELECT role FROM users WHERE user_id = $1', [session.user.user_id]);
        const isAdmin = userRole?.role === 'admin';

        if (post.user_id !== session.user.user_id && !isAdmin) {
            return { success: false, error: 'No tienes permiso para eliminar este post' };
        }

        await db.run(`DELETE FROM community_posts WHERE post_id = $1`, [postId]);

        revalidatePath('/communities');
        return { success: true, message: 'Post eliminado' };
    } catch (error) {
        console.error('Error deleting post:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Report a post
 */
export async function reportPost(postId, reason) {
    const session = await getSession();
    if (!session) return { success: false, error: 'No autenticado' };

    try {
        // Mark post as reported
        await db.run(`
            UPDATE community_posts SET is_reported = true WHERE post_id = $1
        `, [postId]);

        // Create report record
        await db.run(`
            INSERT INTO post_reports (post_id, reported_by, reason)
            VALUES ($1, $2, $3)
        `, [postId, session.user.user_id, reason]);

        return { success: true, message: 'Reporte enviado. Gracias por ayudar a mantener la comunidad segura.' };
    } catch (error) {
        console.error('Error reporting post:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Add a comment to a post
 */
export async function addComment(postId, content) {
    const session = await getSession();
    if (!session) return { success: false, error: 'No autenticado' };

    if (!content || content.trim() === '') {
        return { success: false, error: 'El comentario no puede estar vacío' };
    }

    try {
        const [comment] = await db.getAll(`
            INSERT INTO post_comments (post_id, user_id, content)
            VALUES ($1, $2, $3)
            RETURNING *
        `, [postId, session.user.user_id, content.trim()]);

        return { success: true, data: comment };
    } catch (error) {
        console.error('Error adding comment:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get comments for a post
 */
export async function getComments(postId) {
    try {
        const comments = await db.getAll(`
            SELECT 
                c.*,
                u.first_name,
                u.last_name,
                u.photo_url as user_photo
            FROM post_comments c
            LEFT JOIN users u ON c.user_id = u.user_id
            WHERE c.post_id = $1
            ORDER BY c.created_at ASC
        `, [postId]);

        return { success: true, data: comments };
    } catch (error) {
        console.error('Error fetching comments:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Delete a comment (only author can delete)
 */
export async function deleteComment(commentId) {
    const session = await getSession();
    if (!session) return { success: false, error: 'No autenticado' };

    try {
        const [comment] = await db.getAll(`
            SELECT user_id FROM post_comments WHERE comment_id = $1
        `, [commentId]);

        if (!comment) {
            return { success: false, error: 'Comentario no encontrado' };
        }

        if (comment.user_id !== session.user.user_id) {
            return { success: false, error: 'No tienes permiso para eliminar este comentario' };
        }

        await db.run(`DELETE FROM post_comments WHERE comment_id = $1`, [commentId]);

        return { success: true, message: 'Comentario eliminado' };
    } catch (error) {
        console.error('Error deleting comment:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get recent activity feed (for homepage widget)
 */
export async function getRecentActivityFeed(limit = 5) {
    const session = await getSession();
    if (!session) return { success: true, data: [] };

    try {
        // Get posts from user's communities
        const posts = await db.getAll(`
            SELECT 
                p.post_id,
                p.content,
                p.post_type,
                p.created_at,
                u.first_name,
                c.name as community_name,
                c.slug as community_slug
            FROM community_posts p
            JOIN communities c ON p.community_id = c.community_id
            JOIN community_members cm ON c.community_id = cm.community_id
            LEFT JOIN users u ON p.user_id = u.user_id
            WHERE cm.user_id = $1
            ORDER BY p.created_at DESC
            LIMIT $2
        `, [session.user.user_id, limit]);

        return { success: true, data: posts };
    } catch (error) {
        console.error('Error fetching activity feed:', error);
        return { success: false, error: error.message };
    }
}
