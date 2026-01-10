import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { uploadImageToStorage } from '@/lib/supabase';

// Curated fallback images
const FALLBACK_IMAGES = [
    'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=1024&h=600&q=80',
    'https://images.unsplash.com/photo-1601758228041-f3b2795255db?auto=format&fit=crop&w=1024&h=600&q=80',
    'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1024&h=600&q=80',
    'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=1024&h=600&q=80',
    'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=1024&h=600&q=80',
    'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=1024&h=600&q=80',
    'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=1024&h=600&q=80',
    'https://images.unsplash.com/photo-1511044568932-338cba0ad803?auto=format&fit=crop&w=1024&h=600&q=80',
    'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=1024&h=600&q=80',
    'https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?auto=format&fit=crop&w=1024&h=600&q=80',
];

export const maxDuration = 60;

export async function GET(request) {
    // Note: No auth for migration endpoints (one-time use)

    const apiKey = process.env.GEMINI_API_KEY;
    let useGemini = !!apiKey;
    let genAI = null;
    let imageModel = null;

    if (useGemini) {
        try {
            genAI = new GoogleGenerativeAI(apiKey);
            imageModel = genAI.getGenerativeModel({
                model: "gemini-2.0-flash-exp-image-generation",
                generationConfig: { responseModalities: ["image", "text"] }
            });
        } catch (e) {
            console.error('Failed to init Gemini image model:', e.message);
            useGemini = false;
        }
    }

    try {
        const allPosts = await db.getAll(`
            SELECT post_id, title, slug, tags 
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
        let geminiSuccessCount = 0;

        for (const post of allPosts) {
            let imageUrl = null;

            // Try Gemini image generation
            if (useGemini && imageModel) {
                try {
                    const imagePrompt = `Generate a beautiful, realistic, high-quality photograph for a blog article titled: "${post.title}". 
                    The image should show happy, healthy pets in a warm, inviting setting. 
                    Professional photography style, soft lighting, vibrant colors. No text overlays.`;

                    const imageResult = await imageModel.generateContent(imagePrompt);
                    const imageResponse = await imageResult.response;

                    const imageParts = imageResponse.candidates?.[0]?.content?.parts || [];
                    const imagePart = imageParts.find(part => part.inlineData?.mimeType?.startsWith('image/'));

                    if (imagePart?.inlineData?.data) {
                        const filename = `blog/${post.slug}-${Date.now()}.png`;
                        imageUrl = await uploadImageToStorage(imagePart.inlineData.data, filename);
                        if (imageUrl) geminiSuccessCount++;
                    }
                } catch (imgError) {
                    console.error(`Gemini failed for post ${post.title}:`, imgError.message);
                }
            }

            // Fallback to Unsplash
            if (!imageUrl) {
                imageUrl = FALLBACK_IMAGES[updatedCount % FALLBACK_IMAGES.length];
            }

            await db.run(
                'UPDATE blog_posts SET image_url = $1 WHERE post_id = $2',
                [imageUrl, post.post_id]
            );
            updatedCount++;
        }

        return NextResponse.json({
            success: true,
            message: `Regenerated images for ${updatedCount} posts (${geminiSuccessCount} via Gemini AI)`,
            updated: updatedCount,
            geminiImages: geminiSuccessCount
        });

    } catch (error) {
        console.error('Error regenerating post images:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
