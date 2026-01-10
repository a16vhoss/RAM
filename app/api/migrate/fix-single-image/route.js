import { NextResponse } from 'next/server';
import db from '@/lib/db';

// Curated, verified working Unsplash images
const WORKING_IMAGES = [
    'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=1024&h=600&q=80', // Golden retriever
    'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=1024&h=600&q=80', // Pug
    'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=1024&h=600&q=80', // Dalmatian
    'https://images.unsplash.com/photo-1587764379873-97837921fd44?auto=format&fit=crop&w=1024&h=600&q=80', // Corgi
    'https://images.unsplash.com/photo-1561495376-dc9c7c5b8726?auto=format&fit=crop&w=1024&h=600&q=80', // Cat
    'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=1024&h=600&q=80', // Orange cat
    'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&w=1024&h=600&q=80', // Dog portrait
    'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1024&h=600&q=80', // Two dogs running
    'https://images.unsplash.com/photo-1544568100-847a948585b9?auto=format&fit=crop&w=1024&h=600&q=80', // Cute dog
    'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=1024&h=600&q=80', // Golden smile
];

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const slug = searchParams.get('slug');

        if (slug) {
            // Fix specific post by slug
            const post = await db.getOne('SELECT * FROM blog_posts WHERE slug = $1', [slug]);

            if (!post) {
                return NextResponse.json({ error: 'Post not found' }, { status: 404 });
            }

            // Use a random working image
            const randomIndex = Math.floor(Math.random() * WORKING_IMAGES.length);
            const newImageUrl = WORKING_IMAGES[randomIndex];

            await db.run(
                'UPDATE blog_posts SET image_url = $1 WHERE slug = $2',
                [newImageUrl, slug]
            );

            return NextResponse.json({
                success: true,
                message: `Fixed image for post: ${post.title}`,
                oldImage: post.image_url,
                newImage: newImageUrl
            });
        }

        // Find all posts with broken images
        const posts = await db.getAll('SELECT post_id, slug, title, image_url FROM blog_posts');
        const fixed = [];

        for (const post of posts) {
            // Check if image URL is the known broken one
            if (post.image_url?.includes('photo-1601758228041-f3b2795255db')) {
                const randomIndex = Math.floor(Math.random() * WORKING_IMAGES.length);
                const newImageUrl = WORKING_IMAGES[randomIndex];

                await db.run(
                    'UPDATE blog_posts SET image_url = $1 WHERE post_id = $2',
                    [newImageUrl, post.post_id]
                );

                fixed.push({
                    title: post.title,
                    oldImage: post.image_url,
                    newImage: newImageUrl
                });
            }
        }

        return NextResponse.json({
            success: true,
            message: `Fixed ${fixed.length} posts with broken images`,
            fixed
        });

    } catch (error) {
        console.error('Error fixing image:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
