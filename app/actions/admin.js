'use server';

import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

/**
 * Checks if the current session user is an admin.
 */
async function isAdmin() {
    const session = await getSession();
    if (!session || !session.user) return false;

    // Check role in session or fetch from DB to be safe
    // Ideally session token has the role, but let's query DB for security if needed
    // For now assuming session.user.role is populated, or we query.
    // Let's query db to be sure.

    try {
        const user = await db.getOne('SELECT role FROM users WHERE user_id = $1', [session.user.user_id]);
        return user?.role === 'admin';
    } catch (e) {
        console.error('Error checking admin role:', e);
        return false;
    }
}

/**
 * Get all pending reported posts
 */
export async function getReportedPosts() {
    if (!await isAdmin()) return { success: false, error: 'Unauthorized' };

    try {
        const reports = await db.getAll(`
            SELECT 
                pr.report_id,
                pr.reason,
                pr.status,
                pr.created_at as report_date,
                cp.post_id,
                cp.content as post_content,
                cp.media_urls,
                c.name as community_name,
                c.slug as community_slug,
                u.first_name || ' ' || u.last_name as reporter_name,
                author.first_name || ' ' || author.last_name as author_name,
                author.user_id as author_id
            FROM post_reports pr
            JOIN community_posts cp ON pr.post_id = cp.post_id
            JOIN communities c ON cp.community_id = c.community_id
            LEFT JOIN users u ON pr.reported_by = u.user_id
            LEFT JOIN users author ON cp.user_id = author.user_id
            WHERE pr.status = 'pending'
            ORDER BY pr.created_at DESC
        `);

        return { success: true, data: reports };
    } catch (error) {
        console.error('Error fetching reported posts:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Dismiss a report (mark as reviewed/dismissed)
 */
export async function dismissReport(reportId) {
    if (!await isAdmin()) return { success: false, error: 'Unauthorized' };

    try {
        await db.run(
            "UPDATE post_reports SET status = 'dismissed' WHERE report_id = $1",
            [reportId]
        );

        // Also check if post has no more pending reports, maybe update is_reported flag?
        // For now, simple dismissal.

        revalidatePath('/admin/reports');
        return { success: true };
    } catch (error) {
        console.error('Error dismissing report:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Delete a post (Admin action)
 */
export async function deletePostAsAdmin(postId) {
    if (!await isAdmin()) return { success: false, error: 'Unauthorized' };

    try {
        // First delete reports associated? No, ON DELETE CASCADE should handle it if setup in schema.
        // Schema: post_reports references community_posts ON DELETE CASCADE.

        await db.run('DELETE FROM community_posts WHERE post_id = $1', [postId]);

        revalidatePath('/admin/reports');
        return { success: true };
    } catch (error) {
        console.error('Error deleting post as admin:', error);
        return { success: false, error: error.message };
    }
}
