import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { v4 as uuidv4 } from 'uuid';

export const maxDuration = 60; // Allow 60 seconds for execution (OpenAI can be slow)

export async function GET(request) {
    // Security Check: Verify cron secret if set
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${cronSecret}`) {
            return new Response('Unauthorized', { status: 401 });
        }
    }

    // Check for API Key
    const apiKey = process.env.GEMINI_API_KEY; // Changed env var name
    if (!apiKey) {
        console.log('GEMINI_API_KEY missing, generating mock post.');
        return createMockPost();
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // 2. Topic/Context Selection
        const { searchParams } = new URL(request.url);
        const targetSpecies = searchParams.get('species');
        const targetBreed = searchParams.get('breed');

        let selectedTopic;
        let contextPrompt = "";

        if (targetSpecies) {
            // Targeted generation
            const speciesTopics = [
                `Cuidados específicos para ${targetSpecies}`,
                `Alimentación ideal para ${targetSpecies}`,
                `Juegos y entretenimiento para ${targetSpecies}`,
                `Salud preventiva en ${targetSpecies}`,
                `Entendiendo a tu ${targetSpecies}`
            ];
            selectedTopic = speciesTopics[Math.floor(Math.random() * speciesTopics.length)];
            if (targetBreed) {
                selectedTopic += ` (Enfoque: ${targetBreed})`;
            }
            contextPrompt = `IMPORTANTE: El artículo DEBE estar enfocado específicamente en ${targetSpecies}${targetBreed ? ` de raza ${targetBreed}` : ''}. Asegúrate de incluir "${targetSpecies}" en los tags.`;
        } else {
            // Random generation (fallback)
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
            selectedTopic = topics[Math.floor(Math.random() * topics.length)];
        }

        // 3. Generate Content with Gemini
        const prompt = `
            Actúa como un experto veterinario y blogger de RAM (Registro Animal Mundial).
            Escribe un artículo de blog corto (300-400 palabras) sobre el tema: "${selectedTopic}".
            ${contextPrompt}
            
            Requisitos:
            
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


        // 4. Image Generation (AI)
        // Since standard Gemini API keys don't always support Imagen, we use a robust fallback to Pollinations.ai 
        // which acts as a free, specialized AI image generator. 
        // We create a specific prompt for the image based on the article title.
        const imagePrompt = `Realist cinematic photography of ${postData.title}, ${postData.tags.split(',')[0]}, pet care context, warm lighting, 8k resolution`;
        const encodedPrompt = encodeURIComponent(imagePrompt);

        // Use timestamp + random to ensure 100% unique images (no duplicates)
        const uniqueSeed = Date.now() + Math.floor(Math.random() * 100000);
        const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=600&seed=${uniqueSeed}&nologo=true`;

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
