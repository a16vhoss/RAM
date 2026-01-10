import { NextResponse } from 'next/server';
import db from '@/lib/db';

// Curated array of high-quality pet images from Unsplash (direct URLs that work)
const PET_IMAGES = [
    'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=1024&h=600&q=80', // Golden retriever
    'https://images.unsplash.com/photo-1601758228041-f3b2795255db?auto=format&fit=crop&w=1024&h=600&q=80', // Dog walking
    'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1024&h=600&q=80', // Two dogs playing
    'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=1024&h=600&q=80', // Golden retriever portrait
    'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=1024&h=600&q=80', // French bulldog
    'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=1024&h=600&q=80', // Corgi
    'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=1024&h=600&q=80', // Cat looking
    'https://images.unsplash.com/photo-1511044568932-338cba0ad803?auto=format&fit=crop&w=1024&h=600&q=80', // Happy dog
    'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=1024&h=600&q=80', // Dalmatian
    'https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?auto=format&fit=crop&w=1024&h=600&q=80', // Dog in nature
];

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
            // Pick a unique image from our curated list (cycling through)
            const imageUrl = PET_IMAGES[updatedCount % PET_IMAGES.length];

            // Update the post with new image
            await db.run(
                'UPDATE blog_posts SET image_url = $1 WHERE post_id = $2',
                [imageUrl, post.post_id]
            );
            updatedCount++;
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
