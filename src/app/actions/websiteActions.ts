'use server';

import { getAuthUser } from '@/lib/auth';
import { uploadImage, deleteImage } from '@/lib/storage';

export async function uploadHeroMediaAction(formData: FormData) {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== 'admin') {
      return { success: false, error: 'Unauthorized. Admin access required.' };
    }

    const file = formData.get('file') as File;
    if (!file) {
      return { success: false, error: 'No file provided' };
    }

    const oldUrl = formData.get('oldUrl') as string | null;

    // Delete old file if provided (Resource Management)
    if (oldUrl) {
      try {
        await deleteImage(oldUrl, 'website-media');
      } catch (err) {
        console.warn('Failed to delete old hero media. Proceeding with upload.', err);
      }
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const publicUrl = await uploadImage(buffer, file.name, file.type, 'website-media');

    return { success: true, url: publicUrl };
  } catch (error: any) {
    console.error('Error in uploadHeroMediaAction:', error);
    return { success: false, error: error.message || 'Failed to upload media' };
  }
}
