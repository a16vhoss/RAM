import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request) {
    const { action, data } = await request.json();

    try {
        switch (action) {
            case 'getBlogPosts':
                const posts = await db.getAll("SELECT * FROM blog_posts WHERE status = 'Publicado' ORDER BY published_at DESC");
                return NextResponse.json({ success: true, data: posts });

            case 'getBlogPost':
                const [post] = await db.getAll("SELECT * FROM blog_posts WHERE slug = $1", [data.slug]);
                if (!post) {
                    return NextResponse.json({ success: false, error: 'Not found' });
                }
                // Update view count
                await db.run("UPDATE blog_posts SET views_count = COALESCE(views_count, 0) + 1 WHERE post_id = $1", [post.post_id]);
                return NextResponse.json({ success: true, data: post });

            default:
                return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
        }
    } catch (error) {
        console.error(`RPC Blog error ${action}:`, error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
