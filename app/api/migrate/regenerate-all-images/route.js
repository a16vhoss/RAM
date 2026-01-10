import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request) {
    // Note: No auth for migration endpoints (one-time use)

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
            // Use Unsplash Source for reliable, high-quality pet images
            // Extract main tag for search query
            const tags = (post.tags || 'pets').toLowerCase();
            let searchQuery = 'pet,animal';

            if (tags.includes('perro') || tags.includes('dog') || tags.includes('canino')) {
                searchQuery = 'dog,puppy';
            } else if (tags.includes('gato') || tags.includes('cat') || tags.includes('felino')) {
                searchQuery = 'cat,kitten';
            } else if (tags.includes('ave') || tags.includes('bird')) {
                searchQuery = 'bird,parrot';
            } else if (tags.includes('roedor') || tags.includes('hamster')) {
                searchQuery = 'hamster,rabbit';
            }

            // Create unique image URL using Unsplash Source with unique sig
            const uniqueSig = post.post_id.substring(0, 8) + updatedCount;
            const imageUrl = `https://source.unsplash.com/1024x600/?${searchQuery}&sig=${uniqueSig}`;

            // Update the post with new image
            await db.run(
                'UPDATE blog_posts SET image_url = $1 WHERE post_id = $2',
                [imageUrl, post.post_id]
            );
            updatedCount++;

            // Small delay between requests
            await new Promise(resolve => setTimeout(resolve, 100));
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
