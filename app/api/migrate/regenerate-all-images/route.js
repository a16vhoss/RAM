import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request) {
    // Security Check
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${cronSecret}`) {
            return new Response('Unauthorized', { status: 401 });
        }
    }

    try {
        // Get ALL posts to regenerate their images
        const allPosts = await db.getAll(`
            SELECT post_id, title, tags 
            FROM blog_posts 
            ORDER BY published_at DESC
        `);

        if (allPosts.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No posts found',
                updated: 0
            });
        }

        let updatedCount = 0;

        for (const post of allPosts) {
            // Generate unique image using Pollinations.ai
            // Use post_id hash + timestamp + index for 100% unique seeds
            const imagePrompt = `Realistic cinematic photography of ${post.title}, ${(post.tags || 'pets').split(',')[0]}, pet care context, warm lighting, 8k resolution`;
            const encodedPrompt = encodeURIComponent(imagePrompt);

            // Create truly unique seed from post_id characters + timestamp + counter
            const postIdHash = post.post_id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const uniqueSeed = postIdHash + Date.now() + updatedCount * 12345;
            const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=600&seed=${uniqueSeed}&nologo=true`;

            // Update the post with new image
            await db.run(
                'UPDATE blog_posts SET image_url = $1 WHERE post_id = $2',
                [imageUrl, post.post_id]
            );
            updatedCount++;

            // Small delay to ensure unique timestamps
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        return NextResponse.json({
            success: true,
            message: `Regenerated images for ${updatedCount} posts`,
            updated: updatedCount
        });

    } catch (error) {
        console.error('Error regenerating post images:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
