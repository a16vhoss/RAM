import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(request) {
    const session = await getSession();
    if (!session || !session.user) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin
    const user = await db.getOne('SELECT role FROM users WHERE user_id = $1', [session.user.user_id]);
    if (user?.role !== 'admin') {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const { action, data } = await request.json();

    try {
        switch (action) {
            case 'getReportedPosts':
                const reports = await db.getAll(`
                    SELECT pr.report_id, pr.reason, pr.status, pr.created_at as report_date,
                    cp.post_id, cp.content as post_content, cp.media_urls,
                    c.name as community_name, c.slug as community_slug,
                    u.first_name || ' ' || u.last_name as reporter_name,
                    author.first_name || ' ' || author.last_name as author_name, author.user_id as author_id
                    FROM post_reports pr
                    JOIN community_posts cp ON pr.post_id = cp.post_id
                    JOIN communities c ON cp.community_id = c.community_id
                    LEFT JOIN users u ON pr.reported_by = u.user_id
                    LEFT JOIN users author ON cp.user_id = author.user_id
                    WHERE pr.status = 'pending' ORDER BY pr.created_at DESC
                `);
                return NextResponse.json({ success: true, data: reports });

            case 'dismissReport':
                await db.run("UPDATE post_reports SET status = 'dismissed' WHERE report_id = $1", [data.reportId]);
                return NextResponse.json({ success: true });

            case 'deletePostAsAdmin':
                await db.run('DELETE FROM community_posts WHERE post_id = $1', [data.postId]);
                return NextResponse.json({ success: true });

            default:
                return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
        }
    } catch (error) {
        console.error(`RPC Admin error ${action}:`, error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
