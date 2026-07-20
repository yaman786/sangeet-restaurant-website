import { createClient } from '@supabase/supabase-js';
import env from '@/lib/utils/env';

// Initialize Supabase client
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

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
  if (!supabaseUrl || !supabaseKey || !supabase) {
    const errorMsg = 'Supabase credentials not found. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.';
    console.error(errorMsg);
    
    if (env.isDev) {
      // Allow fallback ONLY in development for UI testing
      console.warn('Development mode: Using stock photo fallback');
      return `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop`;
    }
    throw new Error(errorMsg);
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
