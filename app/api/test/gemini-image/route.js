import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

export const maxDuration = 60;

export async function GET(request) {
    const results = {
        timestamp: new Date().toISOString(),
        checks: {},
        image: null,
        error: null
    };

    // 1. Check API Key
    const apiKey = process.env.GEMINI_API_KEY;
    results.checks.GEMINI_API_KEY = apiKey ? '✅ Set' : '❌ Missing';

    if (!apiKey) {
        results.error = 'GEMINI_API_KEY not configured';
        return NextResponse.json(results, { status: 500 });
    }

    // 2. Check Supabase config
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    results.checks.NEXT_PUBLIC_SUPABASE_URL = supabaseUrl ? '✅ Set' : '❌ Missing';
    results.checks.SUPABASE_SERVICE_ROLE_KEY = supabaseKey ? '✅ Set' : '❌ Missing';

    // 3. Try Gemini image generation
    try {
        const genAI = new GoogleGenerativeAI(apiKey);

        // Try the experimental image generation model
        const imageModel = genAI.getGenerativeModel({
            model: "gemini-2.0-flash-exp-image-generation",
            generationConfig: { responseModalities: ["image", "text"] }
        });

        const prompt = "Generate a cute, realistic photograph of a happy golden retriever puppy sitting in a sunny garden. Professional photography style, soft lighting.";

        results.checks.modelUsed = "gemini-2.0-flash-exp-image-generation";
        results.checks.prompt = prompt;

        const imageResult = await imageModel.generateContent(prompt);
        const imageResponse = await imageResult.response;

        // Extract image from response
        const candidates = imageResponse.candidates || [];
        results.checks.candidatesFound = candidates.length;

        if (candidates.length > 0) {
            const parts = candidates[0]?.content?.parts || [];
            results.checks.partsFound = parts.length;

            const imagePart = parts.find(part => part.inlineData?.mimeType?.startsWith('image/'));

            if (imagePart?.inlineData?.data) {
                results.checks.imageGenerated = '✅ Success';
                results.checks.imageMimeType = imagePart.inlineData.mimeType;
                results.checks.imageDataLength = imagePart.inlineData.data.length;

                // Try to upload to Supabase if configured
                if (supabaseUrl && supabaseKey) {
                    try {
                        const { uploadImageToStorage } = await import('@/lib/supabase');
                        const filename = `test/gemini-test-${Date.now()}.png`;
                        const uploadedUrl = await uploadImageToStorage(imagePart.inlineData.data, filename);

                        if (uploadedUrl) {
                            results.checks.supabaseUpload = '✅ Success';
                            results.image = uploadedUrl;
                        } else {
                            results.checks.supabaseUpload = '❌ Failed (null returned)';
                            // Return base64 as fallback
                            results.image = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data.substring(0, 100)}...`;
                        }
                    } catch (uploadError) {
                        results.checks.supabaseUpload = `❌ Error: ${uploadError.message}`;
                    }
                } else {
                    results.checks.supabaseUpload = '⚠️ Skipped (credentials missing)';
                    // Return truncated base64 preview
                    results.image = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data.substring(0, 100)}...`;
                }
            } else {
                results.checks.imageGenerated = '❌ No image in response parts';
                // Log what we got instead
                results.checks.partsContent = parts.map(p => ({
                    hasText: !!p.text,
                    hasInlineData: !!p.inlineData,
                    mimeType: p.inlineData?.mimeType
                }));
            }
        } else {
            results.checks.imageGenerated = '❌ No candidates in response';
        }

    } catch (error) {
        results.error = error.message;
        results.checks.geminiError = error.message;

        // Check for specific error types
        if (error.message.includes('not found') || error.message.includes('not supported')) {
            results.checks.suggestion = 'The model may not be available. Try gemini-2.0-flash-preview-image-generation or check API access.';
        }
    }

    return NextResponse.json(results, {
        status: results.error ? 500 : 200
    });
}
