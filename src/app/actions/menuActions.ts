'use server';

import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { menuItemSchema, categorySchema } from '@/lib/validations';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { uploadImage } from '@/lib/storage';

export async function uploadMenuImageAction(formData: FormData) {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== 'admin') {
      return { success: false, error: 'Unauthorized. Admin access required.' };
    }

    const file = formData.get('file') as File;
    if (!file) {
      return { success: false, error: 'No file provided' };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const publicUrl = await uploadImage(buffer, file.name, file.type, 'menu-images');

    return { success: true, url: publicUrl };
  } catch (error: any) {
    console.error('Error in uploadMenuImageAction:', error);
    return { success: false, error: error.message || 'Failed to upload image' };
  }
}

export async function createMenuItemAction(data: z.infer<typeof menuItemSchema>) {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== 'admin') {
      return { success: false, error: 'Unauthorized. Admin access required.' };
    }

    const parsedData = menuItemSchema.parse(data);
    const { name, description, price, category, image_url, is_vegetarian, is_spicy, is_popular, preparation_time } = parsedData;
    const allergens = (data as any).allergens || null;

    const item = await prisma.menu_items.create({
      data: {
        name,
        description,
        price,
        category,
        image_url: image_url || null,
        is_vegetarian: is_vegetarian || false,
        is_spicy: is_spicy || false,
        is_popular: is_popular || false,
        allergens: allergens ? JSON.stringify(allergens) : null,
        preparation_time: preparation_time || 15
      }
    });

    revalidatePath('/menu');
    revalidatePath('/admin/menu');
    return { success: true, item };
  } catch (error: any) {
    console.error('Error in createMenuItemAction:', error);
    return { success: false, error: error.message || 'Failed to create menu item' };
  }
}

export async function updateMenuItemAction(id: number | string, data: z.infer<typeof menuItemSchema>) {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== 'admin') {
      return { success: false, error: 'Unauthorized. Admin access required.' };
    }

    const parsedData = menuItemSchema.parse(data);
    const { name, description, price, category, image_url, is_vegetarian, is_spicy, is_popular, preparation_time } = parsedData;
    const allergens = (data as any).allergens || null;

    const item = await prisma.menu_items.update({
      where: { id: typeof id === 'string' ? parseInt(id, 10) : id },
      data: {
        name,
        description,
        price,
        category,
        image_url: image_url || null,
        is_vegetarian: is_vegetarian || false,
        is_spicy: is_spicy || false,
        is_popular: is_popular || false,
        allergens: allergens ? JSON.stringify(allergens) : null,
        preparation_time: preparation_time || 15,
        updated_at: new Date()
      }
    });

    revalidatePath('/menu');
    revalidatePath('/admin/menu');
    return { success: true, item };
  } catch (error: any) {
    console.error('Error in updateMenuItemAction:', error);
    return { success: false, error: error.message || 'Failed to update menu item' };
  }
}

export async function deleteMenuItemAction(id: number | string) {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== 'admin') {
      return { success: false, error: 'Unauthorized. Admin access required.' };
    }

    await prisma.menu_items.delete({
      where: { id: typeof id === 'string' ? parseInt(id, 10) : id }
    });
    
    revalidatePath('/menu');
    revalidatePath('/admin/menu');
    return { success: true };
  } catch (error: any) {
    console.error('Error in deleteMenuItemAction:', error);
    return { success: false, error: error.message || 'Failed to delete menu item' };
  }
}

export async function createCategoryAction(data: z.infer<typeof categorySchema>) {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== 'admin') {
      return { success: false, error: 'Unauthorized. Admin access required.' };
    }

    const parsedData = categorySchema.parse(data);
    
    const category = await prisma.categories.create({
      data: {
        name: parsedData.name,
        display_order: (data as any).display_order || 0,
        parent_id: (data as any).parent_id || null,
        description: (data as any).description || null
      }
    });

    revalidatePath('/menu');
    revalidatePath('/admin/menu');
    return { success: true, category };
  } catch (error: any) {
    console.error('Error in createCategoryAction:', error);
    return { success: false, error: error.message || 'Failed to create category' };
  }
}

export async function updateCategoryAction(id: number | string, data: z.infer<typeof categorySchema>) {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== 'admin') {
      return { success: false, error: 'Unauthorized. Admin access required.' };
    }

    const parsedData = categorySchema.parse(data);
    
    const category = await prisma.categories.update({
      where: { id: typeof id === 'string' ? parseInt(id, 10) : id },
      data: {
        name: parsedData.name,
        display_order: (data as any).display_order || 0,
        parent_id: (data as any).parent_id === undefined ? undefined : (data as any).parent_id,
        description: (data as any).description === undefined ? undefined : (data as any).description,
        updated_at: new Date()
      }
    });

    revalidatePath('/menu');
    revalidatePath('/admin/menu');
    return { success: true, category };
  } catch (error: any) {
    console.error('Error in updateCategoryAction:', error);
    return { success: false, error: error.message || 'Failed to update category' };
  }
}

export async function deleteCategoryAction(id: number | string) {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== 'admin') {
      return { success: false, error: 'Unauthorized. Admin access required.' };
    }

    await prisma.categories.delete({
      where: { id: typeof id === 'string' ? parseInt(id, 10) : id }
    });
    
    revalidatePath('/menu');
    revalidatePath('/admin/menu');
    return { success: true };
  } catch (error: any) {
    console.error('Error in deleteCategoryAction:', error);
    return { success: false, error: error.message || 'Failed to delete category' };
  }
}
