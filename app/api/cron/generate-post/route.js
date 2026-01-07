import { NextResponse } from 'next/server';
import db from '@/lib/db';
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';

export const maxDuration = 60; // Allow 60 seconds for execution (OpenAI can be slow)

export async function GET(request) {
    // 1. Security Check (Basic for now, can be enhanced with CRON_SECRET)
    // const authHeader = request.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //     return new Response('Unauthorized', { status: 401 });
    // }

    // Check for API Key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        console.log('OPENAI_API_KEY missing, generating mock post.');
        return createMockPost();
    }

    try {
        const openai = new OpenAI({ apiKey });

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

        // Pick a random topic or rotate based on day
        const today = new Date();
        const topicIndex = today.getDay() % topics.length; // Simple rotation
        // Or better, random to avoid repetition if run rarely
        const selectedTopic = topics[Math.floor(Math.random() * topics.length)];

        // 3. Generate Content with OpenAI
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini", // Cost effective
            messages: [
                {
                    role: "system",
                    content: "Eres un experto veterinario y amante de los animales que escribe para el blog de RAM (Registro Animal Mundial). Tu tono es amigable, profesional, informativo y empático. Escribes en Markdown. Usas emojis ocasionalmente."
                },
                {
                    role: "user",
                    content: `Escribe un artículo de blog corto (300-400 palabras) sobre el tema: "${selectedTopic}". 
                    
                    Estructura requerida en JSON:
                    {
                        "title": "Un título atractivo y catchy",
                        "slug": "un-slug-seo-friendly",
                        "excerpt": "Un resumen corto de 2 lineas",
                        "content": "El contenido completo en Markdown... con subtítulos (##), listas, etc.",
                        "tags": "tag1, tag2, tag3"
                    }
                    
                    Asegúrate de que la respuesta sea SOLO el JSON válido.`
                }
            ],
            response_format: { type: "json_object" }
        });

        const result = JSON.parse(completion.choices[0].message.content);

        // 4. Image Selection (Using Unsplash Source for simplicity without key)
        // We use keywords from the title/tags to get a relevant random image
        const keywords = result.tags.split(',')[0].trim();
        const imageUrl = `https://source.unsplash.com/800x600/?${keywords},pet`;
        // Note: source.unsplash is deprecated/unreliable sometimes, let's use a standard implementation or static list if it fails. 
        // Better alternative for now: specific collection or keyword
        const reliableImage = `https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=1000`; // Fallback

        // 5. Save to Database
        const postId = uuidv4();

        await db.run(`
            INSERT INTO blog_posts (post_id, title, slug, excerpt, content, tags, image_url, published_at, status, author_name)
            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), 'Publicado', 'RAM AI Assistant')
        `, [
            postId,
            result.title,
            result.slug + '-' + Date.now(), // Ensure uniqueness
            result.excerpt,
            result.content,
            result.tags,
            imageUrl, // Try dynamic first
        ]);

        return NextResponse.json({ success: true, post: result });

    } catch (error) {
        console.error('Error generating post:', error);

        // FAIL SAFE: If no API key or Error, create a Mock Post so user sees SOMETHING
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
