import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request) {
    // Note: No auth for migration endpoints (one-time use)

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
            // Generate unique image using Pollinations.ai
            // Use post_id hash + timestamp for 100% unique seeds
            const imagePrompt = `Realistic cinematic photography of ${post.title}, ${(post.tags || 'pets').split(',')[0]}, pet care context, warm lighting, 8k resolution`;
            const encodedPrompt = encodeURIComponent(imagePrompt);

            // Create unique seed from post_id characters + timestamp
            const postIdHash = post.post_id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const uniqueSeed = postIdHash + Date.now();
            const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=600&seed=${uniqueSeed}&nologo=true`;

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
