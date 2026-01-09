import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { v4 as uuidv4 } from 'uuid';

export const maxDuration = 30;

export async function GET(request) {
    // Security Check: Verify cron secret if set
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${cronSecret}`) {
            return new Response('Unauthorized', { status: 401 });
        }
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return createMockTip();
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const topics = [
            'Hidratación en mascotas',
            'Cuidado dental canino',
            'Enriquecimiento ambiental para gatos',
            'Prevención de parásitos',
            'Alimentación saludable',
            'Ejercicio diario',
            'Seguridad en paseos',
            'Identificación y placas',
            'Socialización temprana',
            'Lenguaje corporal de mascotas'
        ];
        const selectedTopic = topics[Math.floor(Math.random() * topics.length)];

        const prompt = `
            Genera un "Tip del día" para dueños de mascotas sobre el tema: "${selectedTopic}".
            El tip debe ser MUY conciso, máximo 2 oraciones, amable y útil.
            
            Formato JSON:
            {
                "content": "El texto del tip aquí (max 140 cars).",
                "category": "Salud/Nutrición/Cuidado/etc"
            }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const tipData = JSON.parse(jsonString);

        const tipId = uuidv4();

        // Use standard INSERT. The table defaults display_date to CURRENT_DATE.
        // If one already exists for today (unique constraint), we catch the error or use ON CONFLICT DO NOTHING
        // Actually, simple insert is fine, if it fails due to unique constraint, we just skip (it means a tip exists)

        await db.run(`
            INSERT INTO daily_tips (tip_id, content, category, display_date)
            VALUES ($1, $2, $3, CURRENT_DATE)
            ON CONFLICT (display_date) DO UPDATE SET content = $2, category = $3
        `, [tipId, tipData.content, tipData.category]);

        return NextResponse.json({ success: true, tip: tipData });

    } catch (error) {
        console.error('Error generating tip:', error);
        return createMockTip();
    }
}

async function createMockTip() {
    const mock = {
        content: "Cepilla a tu mascota al menos dos veces por semana para reducir la caída de pelo.",
        category: "Higiene"
    };
    const tipId = uuidv4();
    await db.run(`
        INSERT INTO daily_tips (tip_id, content, category, display_date)
        VALUES ($1, $2, $3, CURRENT_DATE)
        ON CONFLICT (display_date) DO UPDATE SET content = $2, category = $3
    `, [tipId, mock.content, mock.category]);

    return NextResponse.json({ success: true, tip: mock, message: "Mock tip created" });
}
