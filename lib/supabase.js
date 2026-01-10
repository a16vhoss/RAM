import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;

function getSupabase() {
    if (!supabase && supabaseUrl && supabaseServiceKey) {
        supabase = createClient(supabaseUrl, supabaseServiceKey);
    }
    return supabase;
}

/**
 * Upload a base64 image to Supabase Storage
 * @param {string} base64Data - Base64 encoded image data
 * @param {string} filename - Name for the file
 * @param {string} bucket - Storage bucket name (default: 'blog-images')
 * @returns {string|null} Public URL of uploaded image or null on failure
 */
export async function uploadImageToStorage(base64Data, filename, bucket = 'blog-images') {
    const client = getSupabase();
    if (!client) {
        console.error('Supabase client not available');
        return null;
    }

    try {
        // Convert base64 to buffer
        const buffer = Buffer.from(base64Data, 'base64');

        // Upload to storage
        const { data, error } = await client.storage
            .from(bucket)
            .upload(filename, buffer, {
                contentType: 'image/png',
                upsert: true
            });

        if (error) {
            console.error('Storage upload error:', error);
            return null;
        }

        // Get public URL
        const { data: urlData } = client.storage
            .from(bucket)
            .getPublicUrl(filename);

        return urlData.publicUrl;
    } catch (error) {
        console.error('Error uploading to storage:', error);
        return null;
    }
}

export default getSupabase;
