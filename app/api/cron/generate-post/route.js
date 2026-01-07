import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { v4 as uuidv4 } from 'uuid';

export const maxDuration = 60; // Allow 60 seconds for execution (OpenAI can be slow)

export async function GET(request) {
    // 1. Security Check (Basic for now, can be enhanced with CRON_SECRET)
    // const authHeader = request.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //     return new Response('Unauthorized', { status: 401 });
    // }

    // Check for API Key
    const apiKey = process.env.GEMINI_API_KEY; // Changed env var name
    if (!apiKey) {
        console.log('GEMINI_API_KEY missing, generating mock post.');
        return createMockPost();
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // 2. Topic Rotation
        const topics = [
            'Cuidados básicos para cachorros',
            'Nutrición canina: Lo que sí y lo que no',
            'Entendiendo el lenguaje corporal de tu gato',
            'Importancia de la vacunación',
            'Tips para viajar con mascotas',
            'Adopción responsable: Qué considerar',
            'Juegos mentales para perros',
            'Higiene dental en mascotas',
            'Cómo presentar una nueva mascota en casa',
            'Golpe de calor: Prevención y síntomas'
        ];

        // Pick a random topic
        const selectedTopic = topics[Math.floor(Math.random() * topics.length)];

        // 3. Generate Content with Gemini
        const prompt = `
            Actúa como un experto veterinario y blogger de RAM (Registro Animal Mundial).
            Escribe un artículo de blog corto (300-400 palabras) sobre el tema: "${selectedTopic}".
            
            Requisitos:
            - Tono: Amigable, profesional, empático.
            - Formato de respuesta: ÚNICAMENTE un objeto JSON válido.
            - Estructura JSON:
            {
                "title": "Un título atractivo",
                "slug": "un-slug-seo-friendly",
                "excerpt": "Resumen corto de 2 lineas",
                "content": "El contenido completo en Markdown (Usa ## para subtítulos, listas, negritas, emojis)",
                "tags": "tag1, tag2, tag3"
            }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean markdown code blocks if present (```json ... ```)
        const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const postData = JSON.parse(jsonString);


        // 4. Image Selection (Using Unsplash Source for simplicity)
        // We use keywords from the title/tags to get a relevant random image
        const keywords = postData.tags.split(',')[0].trim();
        // Fallback image since source.unsplash is unreliable
        const imageUrl = `https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=1000`;

        // 5. Save to Database
        const postId = uuidv4();

        await db.run(`
            INSERT INTO blog_posts (post_id, title, slug, excerpt, content, tags, image_url, published_at, status, author_name)
            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), 'Publicado', 'RAM AI Assistant (Gemini)')
        `, [
            postId,
            postData.title,
            postData.slug + '-' + Date.now(), // Ensure uniqueness
            postData.excerpt,
            postData.content,
            postData.tags,
            imageUrl,
        ]);

        return NextResponse.json({ success: true, post: postData });

    } catch (error) {
        console.error('Error generating post:', error);

        // FAIL SAFE
        if (!apiKey || error.message.includes('API key')) {
            return createMockPost();
        }

        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

async function createMockPost() {
    const mockTopics = [
        {
            title: "5 Tips para el paseo perfecto",
            slug: "tips-paseo-perfecto",
            excerpt: "Descubre cómo hacer que el paseo diario sea una experiencia increíble para ti y tu perro.",
            content: "## La importancia del paseo\n\nEl paseo no es solo para hacer sus necesidades, es un momento de **exploración y vínculo**.\n\n1. **Usa una correa cómoda.**\n2. **Déjalo olfatear.** Es su forma de ver el mundo.\n3. **Hidratación.** Lleva siempre agua.\n\n¡Disfruten el camino!",
            tags: "Perros, Paseo, Tips",
            image: "https://images.unsplash.com/photo-1601758228041-f3b2795255db?auto=format&fit=crop&q=80&w=1000"
        }
    ];
    const mock = mockTopics[0];
    const postId = uuidv4();

    await db.run(`
            INSERT INTO blog_posts (post_id, title, slug, excerpt, content, tags, image_url, published_at, status, author_name)
            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), 'Publicado', 'RAM Mock AI')
        `, [
        postId,
        mock.title,
        mock.slug + '-' + Date.now(),
        mock.excerpt,
        mock.content,
        mock.tags,
        mock.image,
    ]);

    return NextResponse.json({ success: true, message: "Created Mock Post (API Key missing or error)", post: mock });
}
