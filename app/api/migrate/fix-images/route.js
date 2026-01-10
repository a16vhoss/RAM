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
        // Find posts without images
        const postsWithoutImages = await db.getAll(`
            SELECT post_id, title, tags 
            FROM blog_posts 
            WHERE image_url IS NULL OR image_url = ''
        `);

        if (postsWithoutImages.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'All posts already have images',
                updated: 0
            });
        }

        let updatedCount = 0;

        for (const post of postsWithoutImages) {
            // Generate image using Pollinations.ai
            const imagePrompt = `Realistic cinematic photography of ${post.title}, ${(post.tags || 'pets').split(',')[0]}, pet care context, warm lighting, 8k resolution`;
            const encodedPrompt = encodeURIComponent(imagePrompt);
            const randomSeed = Math.floor(Math.random() * 1000);
            const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=600&seed=${randomSeed}&nologo=true`;

            // Update the post
            await db.run(
                'UPDATE blog_posts SET image_url = $1 WHERE post_id = $2',
                [imageUrl, post.post_id]
            );
            updatedCount++;
        }

        return NextResponse.json({
            success: true,
            message: `Updated ${updatedCount} posts with images`,
            updated: updatedCount
        });

    } catch (error) {
        console.error('Error updating post images:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
