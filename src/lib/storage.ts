import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Upload an image to Supabase Storage
 * @param fileBuffer The image buffer
 * @param fileName The desired file name
 * @param contentType The MIME type (e.g., 'image/jpeg')
 * @param bucket Default is 'menu-images'
 * @returns The public URL of the uploaded image
 */
export async function uploadImage(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string,
  bucket: string = 'menu-images'
): Promise<string> {
  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase credentials not found. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.');
    // Fallback URL for development if missing credentials
    return `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop`;
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(`public/${Date.now()}-${fileName}`, fileBuffer, {
      contentType,
      upsert: false,
    });

  if (error) {
    console.error('Supabase upload error:', error);
    throw new Error('Failed to upload image');
  }

  const { data: publicUrlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
}
