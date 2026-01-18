import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(request) {
    const session = await getSession();
    // Some actions might be view only? getPostsFeed? But usually requires auth for likes check.

    const { action, data } = await request.json();

    // Most actions require auth
    if (!session && ['createPost', 'likePost', 'unlikePost', 'deletePost', 'reportPost', 'addComment', 'deleteComment'].includes(action)) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    try {
        switch (action) {
            case 'createPost':
                if (!data.content || !data.content.trim()) return NextResponse.json({ success: false, error: 'Empty content' });
                const [post] = await db.getAll(`
                    INSERT INTO community_posts (community_id, user_id, content, post_type, media_urls)
                    VALUES ($1, $2, $3, $4, $5) RETURNING *
                `, [data.communityId, session.user.user_id, data.content.trim(), data.postType || 'general', JSON.stringify(data.mediaUrls || [])]);
                return NextResponse.json({ success: true, data: post });

            case 'getPostsFeed':
                const limit = data.limit || 20;
                const offset = ((data.page || 1) - 1) * limit;
                const posts = await db.getAll(`
                    SELECT p.*, u.first_name, u.last_name,
                    (SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.post_id) as likes_count,
                    (SELECT COUNT(*) FROM post_comments pc WHERE pc.post_id = p.post_id) as comments_count
                    FROM community_posts p LEFT JOIN users u ON p.user_id = u.user_id
                    WHERE p.community_id = $1 ORDER BY p.is_pinned DESC, p.created_at DESC LIMIT $2 OFFSET $3
                `, [data.communityId, limit, offset]);

                if (session) {
                    const [role] = await db.getAll('SELECT role FROM users WHERE user_id = $1', [session.user.user_id]);
                    const isAdmin = role?.role === 'admin';
                    for (const p of posts) {
                        const [liked] = await db.getAll('SELECT 1 FROM post_likes WHERE post_id = $1 AND user_id = $2', [p.post_id, session.user.user_id]);
                        p.isLiked = !!liked;
                        p.isOwner = p.user_id === session.user.user_id;
                        p.canDelete = p.isOwner || isAdmin;
                    }
                }
                return NextResponse.json({ success: true, data: posts });

            case 'getPost':
                const [singlePost] = await db.getAll(`
                    SELECT p.*, u.first_name, u.last_name, c.name as community_name, c.slug as community_slug
                    FROM community_posts p LEFT JOIN users u ON p.user_id = u.user_id LEFT JOIN communities c ON p.community_id = c.community_id
                    WHERE p.post_id = $1
                `, [data.postId]);
                if (!singlePost) return NextResponse.json({ success: false, error: 'Not found' });

                if (session) {
                    const [liked] = await db.getAll('SELECT 1 FROM post_likes WHERE post_id = $1 AND user_id = $2', [data.postId, session.user.user_id]);
                    const [role] = await db.getAll('SELECT role FROM users WHERE user_id = $1', [session.user.user_id]);
                    singlePost.isLiked = !!liked;
                    singlePost.isOwner = singlePost.user_id === session.user.user_id;
                    singlePost.canDelete = singlePost.isOwner || (role?.role === 'admin');
                }
                return NextResponse.json({ success: true, data: singlePost });

            case 'likePost':
                await db.run('INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2) ON CONFLICT (post_id, user_id) DO NOTHING', [data.postId, session.user.user_id]);
                return NextResponse.json({ success: true });

            case 'unlikePost':
                await db.run('DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2', [data.postId, session.user.user_id]);
                return NextResponse.json({ success: true });

            case 'deletePost':
                const [dPost] = await db.getAll('SELECT user_id FROM community_posts WHERE post_id = $1', [data.postId]);
                if (!dPost) return NextResponse.json({ success: false, error: 'Not found' });
                const [uRole] = await db.getAll('SELECT role FROM users WHERE user_id = $1', [session.user.user_id]);
                if (dPost.user_id !== session.user.user_id && uRole?.role !== 'admin') return NextResponse.json({ success: false, error: 'Unauthorized' });
                await db.run('DELETE FROM community_posts WHERE post_id = $1', [data.postId]);
                return NextResponse.json({ success: true, message: 'Deleted' });

            case 'addComment':
                if (!data.content) return NextResponse.json({ success: false, error: 'Empty' });
                const [comment] = await db.getAll('INSERT INTO post_comments (post_id, user_id, content) VALUES ($1, $2, $3) RETURNING *', [data.postId, session.user.user_id, data.content]);
                return NextResponse.json({ success: true, data: comment });

            case 'getComments':
                const comments = await db.getAll(`SELECT c.*, u.first_name, u.last_name FROM post_comments c LEFT JOIN users u ON c.user_id = u.user_id WHERE c.post_id = $1 ORDER BY c.created_at ASC`, [data.postId]);
                return NextResponse.json({ success: true, data: comments });

            case 'deleteComment':
                const [cComm] = await db.getAll('SELECT user_id FROM post_comments WHERE comment_id = $1', [data.commentId]);
                if (!cComm || cComm.user_id !== session.user.user_id) return NextResponse.json({ success: false, error: 'Unauthorized' });
                await db.run('DELETE FROM post_comments WHERE comment_id = $1', [data.commentId]);
                return NextResponse.json({ success: true });

            case 'getRecentActivityFeed':
                if (!session) return NextResponse.json({ success: true, data: [] });
                const activity = await db.getAll(`
                    SELECT p.post_id, p.content, p.post_type, p.created_at, u.first_name, c.name as community_name, c.slug as community_slug
                    FROM community_posts p JOIN communities c ON p.community_id = c.community_id
                    JOIN community_members cm ON c.community_id = cm.community_id LEFT JOIN users u ON p.user_id = u.user_id
                    WHERE cm.user_id = $1 ORDER BY p.created_at DESC LIMIT $2
                 `, [session.user.user_id, data.limit || 5]);
                return NextResponse.json({ success: true, data: activity });

            default:
                return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
        }
    } catch (error) {
        console.error(`RPC Posts error ${action}:`, error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
